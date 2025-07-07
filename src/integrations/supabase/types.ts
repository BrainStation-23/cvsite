export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      bill_types: {
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
      cv_exports: {
        Row: {
          export_format: string
          export_url: string | null
          exported_at: string
          exported_by: string
          id: string
          profile_id: string
          template_id: string
        }
        Insert: {
          export_format: string
          export_url?: string | null
          exported_at?: string
          exported_by: string
          id?: string
          profile_id: string
          template_id: string
        }
        Update: {
          export_format?: string
          export_url?: string | null
          exported_at?: string
          exported_by?: string
          id?: string
          profile_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_exports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_exports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cv_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_field_display_config: {
        Row: {
          created_at: string
          default_enabled: boolean
          default_mask_value: string | null
          default_masked: boolean
          default_order: number
          display_label: string
          field_name: string
          field_type: string
          id: string
          is_system_field: boolean
          section_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_enabled?: boolean
          default_mask_value?: string | null
          default_masked?: boolean
          default_order?: number
          display_label: string
          field_name: string
          field_type?: string
          id?: string
          is_system_field?: boolean
          section_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_enabled?: boolean
          default_mask_value?: string | null
          default_masked?: boolean
          default_order?: number
          display_label?: string
          field_name?: string
          field_type?: string
          id?: string
          is_system_field?: boolean
          section_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_section_table_mappings: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          section_type: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          section_type: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          section_type?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_template_field_mappings: {
        Row: {
          created_at: string
          display_name: string
          field_order: number
          id: string
          is_masked: boolean
          mask_value: string | null
          original_field_name: string
          section_type: string
          template_id: string
          updated_at: string
          visibility_rules: Json | null
        }
        Insert: {
          created_at?: string
          display_name: string
          field_order?: number
          id?: string
          is_masked?: boolean
          mask_value?: string | null
          original_field_name: string
          section_type?: string
          template_id: string
          updated_at?: string
          visibility_rules?: Json | null
        }
        Update: {
          created_at?: string
          display_name?: string
          field_order?: number
          id?: string
          is_masked?: boolean
          mask_value?: string | null
          original_field_name?: string
          section_type?: string
          template_id?: string
          updated_at?: string
          visibility_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_template_field_mappings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cv_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_template_sections: {
        Row: {
          created_at: string
          display_order: number
          field_mapping: Json | null
          id: string
          is_required: boolean
          section_type: string
          styling_config: Json | null
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_mapping?: Json | null
          id?: string
          is_required?: boolean
          section_type: string
          styling_config?: Json | null
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          field_mapping?: Json | null
          id?: string
          is_required?: boolean
          section_type?: string
          styling_config?: Json | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cv_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          layout_config: Json | null
          name: string
          orientation: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          layout_config?: Json | null
          name: string
          orientation?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          layout_config?: Json | null
          name?: string
          orientation?: string
          updated_at?: string
        }
        Relationships: []
      }
      degrees: {
        Row: {
          created_at: string
          full_form: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_form?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_form?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          full_form: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_form?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_form?: string | null
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
      expertise_types: {
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
      general_information: {
        Row: {
          biography: string | null
          created_at: string
          current_designation: string | null
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
          current_designation?: string | null
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
          current_designation?: string | null
          first_name?: string
          id?: string
          last_name?: string
          profile_id?: string
          profile_image?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_information_current_designation_fkey"
            columns: ["current_designation"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "general_information_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      note_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string
          created_by: string
          id: string
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          created_by: string
          id?: string
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string
          id?: string
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "note_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          career_start_date: string | null
          created_at: string
          date_of_joining: string | null
          email: string | null
          employee_id: string | null
          expertise: string | null
          first_name: string | null
          id: string
          last_name: string | null
          resource_type: string | null
          sbu_id: string | null
          updated_at: string
        }
        Insert: {
          career_start_date?: string | null
          created_at?: string
          date_of_joining?: string | null
          email?: string | null
          employee_id?: string | null
          expertise?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          resource_type?: string | null
          sbu_id?: string | null
          updated_at?: string
        }
        Update: {
          career_start_date?: string | null
          created_at?: string
          date_of_joining?: string | null
          email?: string | null
          employee_id?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          resource_type?: string | null
          sbu_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_expertise_fkey"
            columns: ["expertise"]
            isOneToOne: false
            referencedRelation: "expertise_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_sbu_id_fkey"
            columns: ["sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
            referencedColumns: ["id"]
          },
        ]
      }
      project_types: {
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
      projects: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          end_date: string | null
          id: string
          is_current: boolean | null
          name: string
          profile_id: string
          responsibility: string | null
          role: string
          start_date: string
          technologies_used: string[] | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          name: string
          profile_id: string
          responsibility?: string | null
          role: string
          start_date: string
          technologies_used?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          name?: string
          profile_id?: string
          responsibility?: string | null
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
      projects_management: {
        Row: {
          budget: number | null
          client_name: string | null
          created_at: string
          id: string
          project_manager: string | null
          project_name: string
          project_type: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          created_at?: string
          id?: string
          project_manager?: string | null
          project_name: string
          project_type?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          created_at?: string
          id?: string
          project_manager?: string | null
          project_name?: string
          project_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_management_project_type_fkey"
            columns: ["project_type"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
        ]
      }
      references: {
        Row: {
          company: string | null
          created_at: string
          designation: string | null
          email: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "references_designation_fkey"
            columns: ["designation"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["name"]
          },
        ]
      }
      resource_planning: {
        Row: {
          created_at: string
          engagement_percentage: number | null
          id: string
          profile_id: string
          project_id: string | null
          release_date: string | null
          resource_type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          engagement_percentage?: number | null
          id?: string
          profile_id: string
          project_id?: string | null
          release_date?: string | null
          resource_type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          engagement_percentage?: number | null
          id?: string
          profile_id?: string
          project_id?: string | null
          release_date?: string | null
          resource_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_resource_planning_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_management"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resource_planning_resource_type"
            columns: ["resource_type_id"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_types: {
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
          sbu_head_email: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sbu_head_email?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sbu_head_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      specialized_skills: {
        Row: {
          created_at: string
          id: string
          name: string
          priority: number
          proficiency: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          priority: number
          proficiency: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          priority?: number
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
          priority: number
          proficiency: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          priority?: number
          proficiency: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          priority?: number
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
          expiry_date: string | null
          id: string
          is_renewable: boolean | null
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
          expiry_date?: string | null
          id?: string
          is_renewable?: boolean | null
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
          expiry_date?: string | null
          id?: string
          is_renewable?: boolean | null
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
      calculate_experience_duration: {
        Args: { start_date: string; end_date: string; is_current: boolean }
        Returns: number
      }
      export_profile_json: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      get_dashboard_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_employee_data: {
        Args: { profile_uuid: string }
        Returns: Json
      }
      get_employee_profiles: {
        Args: {
          search_query?: string
          skill_filter?: string
          experience_filter?: string
          education_filter?: string
          training_filter?: string
          achievement_filter?: string
          project_filter?: string
          min_experience_years?: number
          max_experience_years?: number
          min_graduation_year?: number
          max_graduation_year?: number
          completion_status?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      get_experience_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          range: string
          count: number
        }[]
      }
      get_experiences_by_company: {
        Args: { profile_uuid: string }
        Returns: Json
      }
      get_resource_planning_data: {
        Args: {
          search_query?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      get_section_fields: {
        Args: { section_type_param: string }
        Returns: {
          field_name: string
          display_label: string
          default_enabled: boolean
          default_masked: boolean
          default_mask_value: string
          default_order: number
          field_type: string
        }[]
      }
      get_skill_matrix: {
        Args: Record<PropertyKey, never>
        Returns: {
          skill: string
          count: number
        }[]
      }
      has_any_role: {
        Args: { roles: string[] }
        Returns: boolean
      }
      has_role: {
        Args: { _role: string } | { _user_id: string; _role: string }
        Returns: boolean
      }
      import_profile_json: {
        Args: { profile_data: Json; target_user_id?: string }
        Returns: Json
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
      search_certifications: {
        Args: {
          search_query?: string
          provider_filter?: string
          sbu_filter?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_degrees: {
        Args: {
          search_query?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_departments: {
        Args: {
          search_query?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_projects: {
        Args: {
          search_query?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_references: {
        Args: {
          search_query?: string
          page_number?: number
          items_per_page?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_universities: {
        Args: {
          search_query?: string
          type_filter?: string
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
