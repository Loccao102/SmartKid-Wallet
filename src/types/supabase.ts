export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_attempts: {
        Row: {
          assignment_id: string
          attempt_id: string
          completed_at: string
          decision_quality: number
          elapsed_ms: number
          first_try_correct: number
          math_attempts: number
          payload: Json | null
          score: number
          stars: number
          student_id: string
          total_questions: number
        }
        Insert: {
          assignment_id: string
          attempt_id?: string
          completed_at?: string
          decision_quality: number
          elapsed_ms: number
          first_try_correct: number
          math_attempts: number
          payload?: Json | null
          score: number
          stars: number
          student_id: string
          total_questions: number
        }
        Update: {
          assignment_id?: string
          attempt_id?: string
          completed_at?: string
          decision_quality?: number
          elapsed_ms?: number
          first_try_correct?: number
          math_attempts?: number
          payload?: Json | null
          score?: number
          stars?: number
          student_id?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "assignment_attempts_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "weekly_assignments"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "assignment_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      classrooms: {
        Row: {
          academic_year: string
          archived_at: string | null
          classroom_id: string
          created_at: string
          grade_level: number | null
          join_code: string
          name: string
          teacher_id: string
        }
        Insert: {
          academic_year?: string
          archived_at?: string | null
          classroom_id?: string
          created_at?: string
          grade_level?: number | null
          join_code: string
          name: string
          teacher_id: string
        }
        Update: {
          academic_year?: string
          archived_at?: string | null
          classroom_id?: string
          created_at?: string
          grade_level?: number | null
          join_code?: string
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      parent_link_codes: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          link_code: string
          student_id: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          link_code: string
          student_id: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          link_code?: string
          student_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_link_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "parent_link_codes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          display_name: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          display_name: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          display_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      parent_student_links: {
        Row: {
          linked_at: string
          parent_id: string
          student_id: string
        }
        Insert: {
          linked_at?: string
          parent_id: string
          student_id: string
        }
        Update: {
          linked_at?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: true
            referencedRelation: "parent_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "parent_student_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      research_events: {
        Row: {
          after_state: Json | null
          attempt_number: number | null
          auth_user_id: string
          before_state: Json | null
          choice_id: string | null
          consequence_id: string | null
          consequence_instance_id: string | null
          correct: boolean | null
          customer_id: string | null
          customer_index: number | null
          event_id: string
          event_type: string
          expected_answer: number | null
          inserted_at: string
          math_stage: string | null
          metadata: Json | null
          occurred_at: string
          response_time_ms: number | null
          scenario_id: string | null
          scenario_version: number | null
          schema_version: number
          session_id: string
          shift_id: string
          shift_seed: number | null
          shift_template_id: string | null
          shift_template_version: number | null
          shift_variant_index: number | null
          student_key: string
          submitted_answer: number | null
        }
        Insert: {
          after_state?: Json | null
          attempt_number?: number | null
          auth_user_id?: string
          before_state?: Json | null
          choice_id?: string | null
          consequence_id?: string | null
          consequence_instance_id?: string | null
          correct?: boolean | null
          customer_id?: string | null
          customer_index?: number | null
          event_id: string
          event_type: string
          expected_answer?: number | null
          inserted_at?: string
          math_stage?: string | null
          metadata?: Json | null
          occurred_at: string
          response_time_ms?: number | null
          scenario_id?: string | null
          scenario_version?: number | null
          schema_version: number
          session_id: string
          shift_id: string
          shift_seed?: number | null
          shift_template_id?: string | null
          shift_template_version?: number | null
          shift_variant_index?: number | null
          student_key: string
          submitted_answer?: number | null
        }
        Update: {
          after_state?: Json | null
          attempt_number?: number | null
          auth_user_id?: string
          before_state?: Json | null
          choice_id?: string | null
          consequence_id?: string | null
          consequence_instance_id?: string | null
          correct?: boolean | null
          customer_id?: string | null
          customer_index?: number | null
          event_id?: string
          event_type?: string
          expected_answer?: number | null
          inserted_at?: string
          math_stage?: string | null
          metadata?: Json | null
          occurred_at?: string
          response_time_ms?: number | null
          scenario_id?: string | null
          scenario_version?: number | null
          schema_version?: number
          session_id?: string
          shift_id?: string
          shift_seed?: number | null
          shift_template_id?: string | null
          shift_template_version?: number | null
          shift_variant_index?: number | null
          student_key?: string
          submitted_answer?: number | null
        }
        Relationships: []
      }
      student_activity_submissions: {
        Row: {
          activity_kind: string
          assignment_id: string | null
          attempt_number: number
          cart: Json | null
          classroom_id: string
          content_id: string
          created_at: string
          criteria: Json
          elapsed_ms: number | null
          result: Json | null
          score: number
          stars: number
          student_id: string
          submission_id: string
        }
        Insert: {
          activity_kind: string
          assignment_id?: string | null
          attempt_number: number
          cart?: Json | null
          classroom_id: string
          content_id: string
          created_at?: string
          criteria?: Json
          elapsed_ms?: number | null
          result?: Json | null
          score: number
          stars: number
          student_id: string
          submission_id?: string
        }
        Update: {
          activity_kind?: string
          assignment_id?: string | null
          attempt_number?: number
          cart?: Json | null
          classroom_id?: string
          content_id?: string
          created_at?: string
          criteria?: Json
          elapsed_ms?: number | null
          result?: Json | null
          score?: number
          stars?: number
          student_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "weekly_assignments"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "student_activity_submissions_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["classroom_id"]
          },
          {
            foreignKeyName: "student_activity_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      student_learning_snapshots: {
        Row: {
          activity_results: Json
          auth_user_id: string
          coins: number
          completed_missions: string[]
          completed_world_chapters: string[]
          level: number
          mastery: Json
          total_xp: number
          updated_at: string
        }
        Insert: {
          activity_results?: Json
          auth_user_id: string
          coins?: number
          completed_missions?: string[]
          completed_world_chapters?: string[]
          level?: number
          mastery?: Json
          total_xp?: number
          updated_at?: string
        }
        Update: {
          activity_results?: Json
          auth_user_id?: string
          coins?: number
          completed_missions?: string[]
          completed_world_chapters?: string[]
          level?: number
          mastery?: Json
          total_xp?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_learning_snapshots_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          active: boolean
          auth_user_id: string
          classroom_id: string
          created_at: string
          display_name: string
          last_seen_at: string | null
          student_code: string
          username: string
        }
        Insert: {
          active?: boolean
          auth_user_id: string
          classroom_id: string
          created_at?: string
          display_name: string
          last_seen_at?: string | null
          student_code: string
          username: string
        }
        Update: {
          active?: boolean
          auth_user_id?: string
          classroom_id?: string
          created_at?: string
          display_name?: string
          last_seen_at?: string | null
          student_code?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["classroom_id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          display_name: string
          school_name: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          display_name: string
          school_name?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          display_name?: string
          school_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teacher_reviews: {
        Row: {
          assignment_id: string | null
          comment: string
          created_at: string
          review_id: string
          student_id: string
          submission_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          comment: string
          created_at?: string
          review_id?: string
          student_id: string
          submission_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          comment?: string
          created_at?: string
          review_id?: string
          student_id?: string
          submission_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_reviews_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "weekly_assignments"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "teacher_reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "teacher_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_activity_submissions"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "teacher_reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      weekly_assignments: {
        Row: {
          assignment_id: string
          challenge_json: Json
          challenge_seed: number
          challenge_version: number
          classroom_id: string
          coin_reward: number
          created_at: string
          created_by: string
          description: string | null
          due_at: string
          max_attempts: number
          opens_at: string
          status: string
          title: string
          updated_at: string
          week_key: string
          xp_reward: number
        }
        Insert: {
          assignment_id?: string
          challenge_json: Json
          challenge_seed: number
          challenge_version?: number
          classroom_id: string
          coin_reward?: number
          created_at?: string
          created_by: string
          description?: string | null
          due_at: string
          max_attempts?: number
          opens_at: string
          status?: string
          title: string
          updated_at?: string
          week_key: string
          xp_reward?: number
        }
        Update: {
          assignment_id?: string
          challenge_json?: Json
          challenge_seed?: number
          challenge_version?: number
          classroom_id?: string
          coin_reward?: number
          created_at?: string
          created_by?: string
          description?: string | null
          due_at?: string
          max_attempts?: number
          opens_at?: string
          status?: string
          title?: string
          updated_at?: string
          week_key?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_assignments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["classroom_id"]
          },
          {
            foreignKeyName: "weekly_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      weekly_challenge_attempts: {
        Row: {
          attempt_id: string
          auth_user_id: string
          challenge_id: string
          challenge_version: number
          completed_at: string
          created_at: string
          decision_quality: number
          elapsed_ms: number
          first_try_correct: number
          math_attempts: number
          score: number
          stars: number
          total_questions: number
          week_key: string
        }
        Insert: {
          attempt_id?: string
          auth_user_id?: string
          challenge_id: string
          challenge_version: number
          completed_at?: string
          created_at?: string
          decision_quality: number
          elapsed_ms: number
          first_try_correct: number
          math_attempts: number
          score: number
          stars: number
          total_questions: number
          week_key: string
        }
        Update: {
          attempt_id?: string
          auth_user_id?: string
          challenge_id?: string
          challenge_version?: number
          completed_at?: string
          created_at?: string
          decision_quality?: number
          elapsed_ms?: number
          first_try_correct?: number
          math_attempts?: number
          score?: number
          stars?: number
          total_questions?: number
          week_key?: string
        }
        Relationships: []
      }
      weekly_challenge_leaderboard: {
        Row: {
          attempts: number
          best_elapsed_ms: number
          best_first_try_correct: number
          best_score: number
          best_stars: number
          challenge_id: string
          challenge_version: number
          player_code: string
          updated_at: string
          week_key: string
        }
        Insert: {
          attempts?: number
          best_elapsed_ms: number
          best_first_try_correct: number
          best_score: number
          best_stars: number
          challenge_id: string
          challenge_version: number
          player_code: string
          updated_at?: string
          week_key: string
        }
        Update: {
          attempts?: number
          best_elapsed_ms?: number
          best_first_try_correct?: number
          best_score?: number
          best_stars?: number
          challenge_id?: string
          challenge_version?: number
          player_code?: string
          updated_at?: string
          week_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
