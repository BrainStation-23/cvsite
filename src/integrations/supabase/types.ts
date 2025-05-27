export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      degrees: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      designations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string | null
          department: string | null
          end_date: string | null
          gpa: string | null
          id: string
          is_current: boolean | null
          profile_id: string
          start_date: string
          university: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          department?: string | null
          end_date?: string | null
          gpa?: string | null
          id?: string
          is_current?: boolean | null
          profile_id: string
          start_date: string
          university: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          department?: string | null
          end_date?: string | null
          gpa?: string | null
          id?: string
          is_current?: boolean | null
          profile_id?: string
          start_date?: string
          university?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_degree_fkey"
            columns: ["degree"]
            isOneToOne: false
            referencedRelation: "degrees"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "education_department_fkey"
            columns: ["department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_university_fkey"
            columns: ["university"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["name"]
          },
        ]
      }
      employees: {
        Row: {
          biography: string | null
          created_at: string
          designation: string | null
          first_name: string
          id: string
          last_name: string
          profile_image: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          designation?: string | null
          first_name: string
          id?: string
          last_name: string
          profile_image?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          designation?: string | null
          first_name?: string
          id?: string
          last_name?: string
          profile_image?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          designation: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          profile_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          designation?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          profile_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          designation?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          profile_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_designation_fkey"
            columns: ["designation"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      general_information: {
        Row: {
          biography: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          profile_id: string
          profile_image: string | null
          updated_at: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          profile_id: string
          profile_image?: string | null
          updated_at?: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          profile_id?: string
          profile_image?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_information_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          employee_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          id: string
          is_current: boolean | null
          name: string
          profile_id: string
          role: string
          start_date: string
          technologies_used: string[] | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          name: string
          profile_id: string
          role: string
          start_date: string
          technologies_used?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          name?: string
          profile_id?: string
          role?: string
          start_date?: string
          technologies_used?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      references: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sbus: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialized_skills: {
        Row: {
          created_at: string
          id: string
          name: string
          proficiency: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          proficiency: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          proficiency?: number
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialized_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_skills: {
        Row: {
          created_at: string
          id: string
          name: string
          proficiency: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          proficiency: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          proficiency?: number
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          certificate_url: string | null
          certification_date: string
          created_at: string
          description: string | null
          id: string
          profile_id: string
          provider: string
          title: string
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          certification_date: string
          created_at?: string
          description?: string | null
          id?: string
          profile_id: string
          provider: string
          title: string
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          certification_date?: string
          created_at?: string
          description?: string | null
          id?: string
          profile_id?: string
          provider?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          acronyms: string | null
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          acronyms?: string | null
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          acronyms?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_employee_profiles: {
        Args: {
          search_query?: string
          skill_filter?: string
          experience_filter?: string
          education_filter?: string
          training_filter?: string
          achievement_filter?: string
          project_filter?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      has_any_role: {
        Args: { roles: string[] }
        Returns: boolean
      }
      has_role: {
        Args: { _role: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_users: {
        Args: {
          search_query?: string
          filter_role?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
