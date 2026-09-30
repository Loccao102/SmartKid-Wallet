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
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function createStudentCode(joinCode: string, username: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `SK-${joinCode}-${username.slice(0, 6).toUpperCase()}-${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server is not configured." }, 500);
  }

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Missing authorization." }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return json({ error: "Invalid session." }, 401);
  }

  const teacherId = authData.user.id;
  if (authData.user.is_anonymous) {
    return json({ error: "Teacher account required." }, 403);
  }

  const { data: teacher, error: teacherError } = await admin
    .from("teacher_profiles")
    .select("auth_user_id")
    .eq("auth_user_id", teacherId)
    .maybeSingle();

  if (teacherError || !teacher) {
    return json({ error: "Teacher profile not found." }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const action = String(body.action ?? "");
  const classroomId = String(body.classroomId ?? "");
  if (!classroomId) return json({ error: "classroomId is required." }, 400);

  const { data: classroom, error: classroomError } = await admin
    .from("classrooms")
    .select("classroom_id,join_code,name,teacher_id")
    .eq("classroom_id", classroomId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (classroomError || !classroom) {
    return json({ error: "Classroom not found or not owned by teacher." }, 404);
  }

  if (action === "create_student") {
    const displayName = String(body.displayName ?? "").trim();
    const username = normalizeUsername(String(body.username ?? ""));
    const password = String(body.password ?? "");

    if (displayName.length < 1 || displayName.length > 120) {
      return json({ error: "Tên học sinh không hợp lệ." }, 400);
    }
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      return json({ error: "Username cần 3-32 ký tự a-z, 0-9, ., _, -." }, 400);
    }
    if (password.length < 8) {
      return json({ error: "Mật khẩu tạm cần ít nhất 8 ký tự." }, 400);
    }

    const { data: existing } = await admin
      .from("student_profiles")
      .select("auth_user_id")
      .eq("classroom_id", classroomId)
      .ilike("username", username)
      .maybeSingle();

    if (existing) {
      return json({ error: "Username đã tồn tại trong lớp." }, 409);
    }

    const syntheticEmail =
      `${username}.${String(classroom.join_code).toLowerCase()}@student.smartkid.local`;
    const studentCode = createStudentCode(String(classroom.join_code), username);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      app_metadata: {
        app_role: "student",
        classroom_id: classroomId,
      },
      user_metadata: {
        display_name: displayName,
        username,
        class_code: classroom.join_code,
      },
    });

    if (createError || !created.user) {
      return json({ error: createError?.message ?? "Không tạo được tài khoản." }, 400);
    }

    const { error: profileError } = await admin.from("student_profiles").insert({
      auth_user_id: created.user.id,
      classroom_id: classroomId,
      username,
      display_name: displayName,
      student_code: studentCode,
      active: true,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError.message }, 400);
    }

    return json({
      student: {
        authUserId: created.user.id,
        classroomId,
        displayName,
        username,
        studentCode,
        classCode: classroom.join_code,
      },
    }, 201);
  }

  const studentId = String(body.studentId ?? "");
  if (!studentId) return json({ error: "studentId is required." }, 400);

  const { data: student, error: studentError } = await admin
    .from("student_profiles")
    .select("auth_user_id,classroom_id,username,display_name,active")
    .eq("auth_user_id", studentId)
    .eq("classroom_id", classroomId)
    .maybeSingle();

  if (studentError || !student) {
    return json({ error: "Student not found in this classroom." }, 404);
  }

  if (action === "reset_password") {
    const password = String(body.password ?? "");
    if (password.length < 8) {
      return json({ error: "Mật khẩu mới cần ít nhất 8 ký tự." }, 400);
    }
    const { error } = await admin.auth.admin.updateUserById(studentId, { password });
    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  }

  if (action === "set_active") {
    const active = Boolean(body.active);
    const { error: authUpdateError } = await admin.auth.admin.updateUserById(
      studentId,
      { ban_duration: active ? "none" : "876000h" },
    );
    if (authUpdateError) {
      return json({ error: authUpdateError.message }, 400);
    }

    const { error: profileUpdateError } = await admin
      .from("student_profiles")
      .update({ active })
      .eq("auth_user_id", studentId);

    if (profileUpdateError) {
      return json({ error: profileUpdateError.message }, 400);
    }

    return json({ success: true, active });
  }

  return json({ error: "Unsupported action." }, 400);
});
