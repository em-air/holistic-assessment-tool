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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessment_sessions: {
        Row: {
          completed_at: string | null
          id: string
          overall_progress: number
          session_type: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          overall_progress?: number
          session_type: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          overall_progress?: number
          session_type?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          assigned_teacher_id: string | null
          created_at: string
          grade: string | null
          id: string
          parent_email: string | null
          role: string
          student_email: string | null
          student_name: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          assigned_teacher_id?: string | null
          created_at?: string
          grade?: string | null
          id: string
          parent_email?: string | null
          role?: string
          student_email?: string | null
          student_name?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          assigned_teacher_id?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          parent_email?: string | null
          role?: string
          student_email?: string | null
          student_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assigned_teacher_id_fkey"
            columns: ["assigned_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer_data: Json
          content: Json
          created_at: string
          difficulty: string | null
          grade: string | null
          id: string
          order_index: number
          quiz_type: string
          updated_at: string
        }
        Insert: {
          answer_data?: Json
          content?: Json
          created_at?: string
          difficulty?: string | null
          grade?: string | null
          id: string
          order_index?: number
          quiz_type: string
          updated_at?: string
        }
        Update: {
          answer_data?: Json
          content?: Json
          created_at?: string
          difficulty?: string | null
          grade?: string | null
          id?: string
          order_index?: number
          quiz_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_metadata: {
        Row: {
          allowed_grades: string[]
          category: string
          created_at: string
          id: string
          is_active: boolean
          quiz_id: string
          quiz_name: string
          subcategory: string
        }
        Insert: {
          allowed_grades?: string[]
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          quiz_id: string
          quiz_name: string
          subcategory: string
        }
        Update: {
          allowed_grades?: string[]
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          quiz_id?: string
          quiz_name?: string
          subcategory?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          additional_data: Json | null
          category: string
          completed_at: string
          grade_level: string | null
          id: string
          percentage: number
          quiz_id: string
          quiz_name: string
          score: number
          subcategory: string
          time_spent: number
          total_questions: number
          user_id: string
        }
        Insert: {
          additional_data?: Json | null
          category: string
          completed_at?: string
          grade_level?: string | null
          id?: string
          percentage: number
          quiz_id: string
          quiz_name: string
          score: number
          subcategory: string
          time_spent?: number
          total_questions: number
          user_id: string
        }
        Update: {
          additional_data?: Json | null
          category?: string
          completed_at?: string
          grade_level?: string | null
          id?: string
          percentage?: number
          quiz_id?: string
          quiz_name?: string
          score?: number
          subcategory?: string
          time_spent?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          emailed_to: string[] | null
          generated_at: string
          id: string
          pdf_url: string
          report_type: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          emailed_to?: string[] | null
          generated_at?: string
          id?: string
          pdf_url: string
          report_type: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          emailed_to?: string[] | null
          generated_at?: string
          id?: string
          pdf_url?: string
          report_type?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_statistics: {
        Row: {
          average_score: number | null
          category: string | null
          date: string | null
          quiz_completions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_progress: {
        Args: { p_user_id: string }
        Returns: {
          average_score: number
          category: string
          completed_count: number
          total_available: number
        }[]
      }
      get_user_recent_activity: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          category: string
          completed_at: string
          percentage: number
          quiz_id: string
          quiz_name: string
          score: number
        }[]
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
