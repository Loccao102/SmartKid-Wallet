import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server not configured" }, 500);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Missing authorization" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user || userData.user.is_anonymous) {
    return json({ error: "Parent account required" }, 401);
  }
  if (userData.user.app_metadata?.app_role === "student") {
    return json({ error: "Student account cannot be linked as parent" }, 403);
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || String(body.action ?? "") !== "redeem") return json({ error: "Unsupported action" }, 400);

  const displayName = String(body.displayName ?? "").trim();
  const linkCode = String(body.linkCode ?? "").trim().toUpperCase();
  if (!displayName || displayName.length > 120) return json({ error: "Tên phụ huynh không hợp lệ." }, 400);
  if (!/^[A-Z0-9]{8,16}$/.test(linkCode)) return json({ error: "Mã liên kết không hợp lệ." }, 400);

  const parentId = userData.user.id;
  const { data: existingLink } = await admin
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_id", parentId)
    .maybeSingle();
  if (existingLink) return json({ error: "Tài khoản phụ huynh đã liên kết với một học sinh." }, 409);

  const { data: code, error: codeError } = await admin
    .from("parent_link_codes")
    .select("link_code,student_id,expires_at,used_at")
    .eq("link_code", linkCode)
    .maybeSingle();
  if (codeError || !code) return json({ error: "Không tìm thấy mã liên kết." }, 404);
  if (code.used_at) return json({ error: "Mã liên kết đã được sử dụng." }, 409);
  if (new Date(code.expires_at).getTime() < Date.now()) return json({ error: "Mã liên kết đã hết hạn." }, 410);

  const { error: profileError } = await admin.from("parent_profiles").upsert({
    auth_user_id: parentId,
    display_name: displayName,
    updated_at: new Date().toISOString(),
  });
  if (profileError) return json({ error: profileError.message }, 400);

  const { error: linkError } = await admin
    .from("parent_student_links")
    .insert({ parent_id: parentId, student_id: code.student_id });
  if (linkError) return json({ error: linkError.message }, 400);

  const { error: updateCodeError } = await admin
    .from("parent_link_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("link_code", linkCode)
    .is("used_at", null);
  if (updateCodeError) return json({ error: updateCodeError.message }, 400);

  await admin.auth.admin.updateUserById(parentId, {
    app_metadata: { ...userData.user.app_metadata, app_role: "parent" },
    user_metadata: { ...userData.user.user_metadata, display_name: displayName },
  });

  return json({ success: true, studentId: code.student_id });
});
