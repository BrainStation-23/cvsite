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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
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
          {
            foreignKeyName: "achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      bench_bill_types: {
        Row: {
          bill_type: string | null
          created_at: string
          id: string
        }
        Insert: {
          bill_type?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          bill_type?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bench_bill_types_bill_type_fkey"
            columns: ["bill_type"]
            isOneToOne: false
            referencedRelation: "bill_types"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_type_change_history: {
        Row: {
          changed_at: string
          created_at: string
          id: string
          new_bill_type_id: string | null
          old_bill_type_id: string | null
          profile_id: string | null
          project_id: string | null
        }
        Insert: {
          changed_at?: string
          created_at?: string
          id?: string
          new_bill_type_id?: string | null
          old_bill_type_id?: string | null
          profile_id?: string | null
          project_id?: string | null
        }
        Update: {
          changed_at?: string
          created_at?: string
          id?: string
          new_bill_type_id?: string | null
          old_bill_type_id?: string | null
          profile_id?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_type_change_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_type_change_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      bill_types: {
        Row: {
          color_code: string
          created_at: string
          id: string
          is_billable: boolean
          is_support: boolean | null
          name: string
          non_billed: boolean | null
          resource_type: string | null
          updated_at: string
        }
        Insert: {
          color_code?: string
          created_at?: string
          id?: string
          is_billable?: boolean
          is_support?: boolean | null
          name: string
          non_billed?: boolean | null
          resource_type?: string | null
          updated_at?: string
        }
        Update: {
          color_code?: string
          created_at?: string
          id?: string
          is_billable?: boolean
          is_support?: boolean | null
          name?: string
          non_billed?: boolean | null
          resource_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_types_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_configs: {
        Row: {
          created_at: string | null
          function_name: string
          id: string
          is_enabled: boolean | null
          job_name: string
          schedule: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          function_name: string
          id?: string
          is_enabled?: boolean | null
          job_name: string
          schedule: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          function_name?: string
          id?: string
          is_enabled?: boolean | null
          job_name?: string
          schedule?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_sbu_bound: boolean | null
          is_self_bound: boolean
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_sbu_bound?: boolean | null
          is_self_bound?: boolean
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_sbu_bound?: boolean | null
          is_self_bound?: boolean
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cv_data_audit_logs: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          profile_id: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          profile_id: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          profile_id?: string
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_data_audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_data_audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      cv_templates: {
        Row: {
          achievements_limit: number | null
          created_at: string
          data_source_function: string
          education_limit: number | null
          enabled: boolean
          experiences_limit: number | null
          html_template: string
          id: string
          is_default: boolean
          name: string
          orientation: string
          projects_limit: number | null
          specialized_skills_limit: number | null
          technical_skills_limit: number | null
          trainings_limit: number | null
          updated_at: string
        }
        Insert: {
          achievements_limit?: number | null
          created_at?: string
          data_source_function?: string
          education_limit?: number | null
          enabled?: boolean
          experiences_limit?: number | null
          html_template: string
          id?: string
          is_default?: boolean
          name: string
          orientation?: string
          projects_limit?: number | null
          specialized_skills_limit?: number | null
          technical_skills_limit?: number | null
          trainings_limit?: number | null
          updated_at?: string
        }
        Update: {
          achievements_limit?: number | null
          created_at?: string
          data_source_function?: string
          education_limit?: number | null
          enabled?: boolean
          experiences_limit?: number | null
          html_template?: string
          id?: string
          is_default?: boolean
          name?: string
          orientation?: string
          projects_limit?: number | null
          specialized_skills_limit?: number | null
          technical_skills_limit?: number | null
          trainings_limit?: number | null
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
      degrees_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
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
      departments_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
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
      designations_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
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
          university: string | null
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
          university?: string | null
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
          university?: string | null
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
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
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
      forced_image_uploads: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          profile_id: string
          updated_at: string
          upload_timestamp: string
          uploaded_by_user_id: string
          validation_errors: Json
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id: string
          updated_at?: string
          upload_timestamp?: string
          uploaded_by_user_id: string
          validation_errors?: Json
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id?: string
          updated_at?: string
          upload_timestamp?: string
          uploaded_by_user_id?: string
          validation_errors?: Json
        }
        Relationships: [
          {
            foreignKeyName: "forced_image_uploads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forced_image_uploads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "forced_image_uploads_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forced_image_uploads_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
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
          {
            foreignKeyName: "general_information_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
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
      hr_contacts_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Relationships: []
      }
      job_role: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          name: string | null
          purpose: string | null
          responsibilities: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string | null
          purpose?: string | null
          responsibilities?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string | null
          purpose?: string | null
          responsibilities?: string | null
        }
        Relationships: []
      }
      job_type: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      non_billed_resources: {
        Row: {
          bill_type_id: string | null
          created_at: string
          id: string
          non_billed_resources_date: string | null
          non_billed_resources_feedback: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          bill_type_id?: string | null
          created_at?: string
          id?: string
          non_billed_resources_date?: string | null
          non_billed_resources_feedback?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bill_type_id?: string | null
          created_at?: string
          id?: string
          non_billed_resources_date?: string | null
          non_billed_resources_feedback?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bench_bill_type_id_fkey"
            columns: ["bill_type_id"]
            isOneToOne: false
            referencedRelation: "bill_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bench_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bench_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
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
      note_categories_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
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
          {
            foreignKeyName: "notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      performance_improvement_plans: {
        Row: {
          created_at: string
          created_by: string
          end_date: string
          final_review: string | null
          id: string
          mid_date: string | null
          overall_feedback: string | null
          profile_id: string
          start_date: string
          status: Database["public"]["Enums"]["pip_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date: string
          final_review?: string | null
          id?: string
          mid_date?: string | null
          overall_feedback?: string | null
          profile_id: string
          start_date: string
          status?: Database["public"]["Enums"]["pip_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string
          final_review?: string | null
          id?: string
          mid_date?: string | null
          overall_feedback?: string | null
          profile_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["pip_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_improvement_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      permission_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: Database["public"]["Enums"]["permission_type_enum"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["permission_type_enum"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["permission_type_enum"]
        }
        Relationships: []
      }
      pip_pm_feedback: {
        Row: {
          behavioral_areas: string[] | null
          behavioral_gap_description: string | null
          behavioral_gap_example: string | null
          created_at: string
          created_by: string
          id: string
          pip_id: string
          skill_areas: string[] | null
          skill_gap_description: string | null
          skill_gap_example: string | null
          updated_at: string
        }
        Insert: {
          behavioral_areas?: string[] | null
          behavioral_gap_description?: string | null
          behavioral_gap_example?: string | null
          created_at?: string
          created_by: string
          id?: string
          pip_id: string
          skill_areas?: string[] | null
          skill_gap_description?: string | null
          skill_gap_example?: string | null
          updated_at?: string
        }
        Update: {
          behavioral_areas?: string[] | null
          behavioral_gap_description?: string | null
          behavioral_gap_example?: string | null
          created_at?: string
          created_by?: string
          id?: string
          pip_id?: string
          skill_areas?: string[] | null
          skill_gap_description?: string | null
          skill_gap_example?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pip_pm_feedback_pip_id_fkey"
            columns: ["pip_id"]
            isOneToOne: false
            referencedRelation: "performance_improvement_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          career_start_date: string | null
          created_at: string
          date_of_birth: string | null
          date_of_joining: string | null
          email: string | null
          employee_id: string | null
          exit_date: string | null
          expertise: string | null
          first_name: string | null
          has_overhead: boolean
          id: string
          job_role: string | null
          job_type: string | null
          last_name: string | null
          manager: string | null
          resignation_date: string | null
          resource_type: string | null
          sbu_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          career_start_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          email?: string | null
          employee_id?: string | null
          exit_date?: string | null
          expertise?: string | null
          first_name?: string | null
          has_overhead?: boolean
          id: string
          job_role?: string | null
          job_type?: string | null
          last_name?: string | null
          manager?: string | null
          resignation_date?: string | null
          resource_type?: string | null
          sbu_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          career_start_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          email?: string | null
          employee_id?: string | null
          exit_date?: string | null
          expertise?: string | null
          first_name?: string | null
          has_overhead?: boolean
          id?: string
          job_role?: string | null
          job_type?: string | null
          last_name?: string | null
          manager?: string | null
          resignation_date?: string | null
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
            foreignKeyName: "profiles_job_role_fkey"
            columns: ["job_role"]
            isOneToOne: false
            referencedRelation: "job_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_job_type_fkey"
            columns: ["job_type"]
            isOneToOne: false
            referencedRelation: "job_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_fkey"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_fkey"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      projects_management: {
        Row: {
          budget: number | null
          client_name: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          project_bill_type: string | null
          project_level: string | null
          project_manager: string | null
          project_name: string
          project_type: string | null
          sbu_id: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          project_bill_type?: string | null
          project_level?: string | null
          project_manager?: string | null
          project_name: string
          project_type?: string | null
          sbu_id?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          project_bill_type?: string | null
          project_level?: string | null
          project_manager?: string | null
          project_name?: string
          project_type?: string | null
          sbu_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_management_project_manager_fkey"
            columns: ["project_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_management_project_manager_fkey"
            columns: ["project_manager"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "projects_management_project_type_fkey"
            columns: ["project_type"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_management_sbu_id_fkey"
            columns: ["sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
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
      references_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Relationships: []
      }
      resource_planning: {
        Row: {
          bill_type_id: string | null
          billing_percentage: number | null
          created_at: string
          engagement_complete: boolean
          engagement_percentage: number | null
          engagement_start_date: string | null
          id: string
          is_forecasted: boolean | null
          profile_id: string
          project_id: string | null
          release_date: string | null
          updated_at: string
          weekly_validation: boolean | null
        }
        Insert: {
          bill_type_id?: string | null
          billing_percentage?: number | null
          created_at?: string
          engagement_complete?: boolean
          engagement_percentage?: number | null
          engagement_start_date?: string | null
          id?: string
          is_forecasted?: boolean | null
          profile_id: string
          project_id?: string | null
          release_date?: string | null
          updated_at?: string
          weekly_validation?: boolean | null
        }
        Update: {
          bill_type_id?: string | null
          billing_percentage?: number | null
          created_at?: string
          engagement_complete?: boolean
          engagement_percentage?: number | null
          engagement_start_date?: string | null
          id?: string
          is_forecasted?: boolean | null
          profile_id?: string
          project_id?: string | null
          release_date?: string | null
          updated_at?: string
          weekly_validation?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_planning_bill_type_id_fkey"
            columns: ["bill_type_id"]
            isOneToOne: false
            referencedRelation: "bill_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_planning_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_planning_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "resource_planning_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_management"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_planning_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          resource_planning_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          resource_planning_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          resource_planning_id?: string
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          module_id: string | null
          permission_type_id: string
          role_id: string
          sbu_restrictions: string[] | null
          sub_module_id: string
          table_restrictions: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          permission_type_id: string
          role_id: string
          sbu_restrictions?: string[] | null
          sub_module_id: string
          table_restrictions?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          permission_type_id?: string
          role_id?: string
          sbu_restrictions?: string[] | null
          sub_module_id?: string
          table_restrictions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_type_id_fkey"
            columns: ["permission_type_id"]
            isOneToOne: false
            referencedRelation: "permission_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_sub_module_id_fkey"
            columns: ["sub_module_id"]
            isOneToOne: false
            referencedRelation: "sub_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      sbu_change_history: {
        Row: {
          changed_at: string
          created_at: string
          id: string
          new_sbu_id: string | null
          old_sbu_id: string | null
          profile_id: string
        }
        Insert: {
          changed_at?: string
          created_at?: string
          id?: string
          new_sbu_id?: string | null
          old_sbu_id?: string | null
          profile_id: string
        }
        Update: {
          changed_at?: string
          created_at?: string
          id?: string
          new_sbu_id?: string | null
          old_sbu_id?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sbu_change_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sbu_change_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sbus: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          is_department: boolean | null
          name: string
          sbu_head_email: string | null
          sbu_head_name: string | null
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          is_department?: boolean | null
          name: string
          sbu_head_email?: string | null
          sbu_head_name?: string | null
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          is_department?: boolean | null
          name?: string
          sbu_head_email?: string | null
          sbu_head_name?: string | null
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
          {
            foreignKeyName: "specialized_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sub_modules: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          module_id: string
          name: string
          route_path: string | null
          table_names: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_id: string
          name: string
          route_path?: string | null
          table_names?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string
          name?: string
          route_path?: string | null
          table_names?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
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
          {
            foreignKeyName: "technical_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "trainings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
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
      universities_audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation_type: string
          record_id: string
          user_designation: string | null
          user_role: string | null
          user_sbu_name: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type: string
          record_id: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation_type?: string
          record_id?: string
          user_designation?: string | null
          user_role?: string | null
          user_sbu_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string
          custom_role_id: string | null
          id: string
          role: string | null
          sbu_context: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          custom_role_id?: string | null
          id?: string
          role?: string | null
          sbu_context?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          custom_role_id?: string | null
          id?: string
          role?: string | null
          sbu_context?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sbu_context_fkey"
            columns: ["sbu_context"]
            isOneToOne: false
            referencedRelation: "sbus"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_score_card: {
        Row: {
          billed_count: number
          created_at: string
          id: string
          jsonb_record: Json
          non_billed_count: number
          updated_at: string
          utilization_rate: number
        }
        Insert: {
          billed_count?: number
          created_at?: string
          id?: string
          jsonb_record: Json
          non_billed_count?: number
          updated_at?: string
          utilization_rate?: number
        }
        Update: {
          billed_count?: number
          created_at?: string
          id?: string
          jsonb_record?: Json
          non_billed_count?: number
          updated_at?: string
          utilization_rate?: number
        }
        Relationships: []
      }
    }
    Views: {
      resource_availability_view: {
        Row: {
          availability_status: string | null
          breakdown: Json | null
          cumulative_billing_percent: number | null
          cumulative_engagement_percent: number | null
          days_until_available: number | null
          final_release_date: string | null
          profile_id: string | null
        }
        Relationships: []
      }
      resource_planning_enriched_view: {
        Row: {
          bill_type_color_code: string | null
          bill_type_id: string | null
          bill_type_is_billable: boolean | null
          bill_type_is_support: boolean | null
          bill_type_name: string | null
          bill_type_non_billed: boolean | null
          billing_percentage: number | null
          client_name: string | null
          created_at: string | null
          current_designation: string | null
          engagement_complete: boolean | null
          engagement_percentage: number | null
          engagement_start_date: string | null
          expertise: string | null
          expertise_id: string | null
          first_name: string | null
          full_name: string | null
          id: string | null
          last_name: string | null
          manager_display_first_name: string | null
          manager_display_last_name: string | null
          manager_employee_id: string | null
          manager_first_name: string | null
          manager_full_name: string | null
          manager_last_name: string | null
          profile_email: string | null
          profile_employee_id: string | null
          profile_first_name: string | null
          profile_has_overhead: boolean | null
          profile_id: string | null
          profile_image: string | null
          profile_last_name: string | null
          profile_manager_id: string | null
          profile_sbu_id: string | null
          project_bill_type: string | null
          project_budget: number | null
          project_description: string | null
          project_id: string | null
          project_is_active: boolean | null
          project_is_forecasted: boolean | null
          project_level: string | null
          project_manager_display_first_name: string | null
          project_manager_display_last_name: string | null
          project_manager_employee_id: string | null
          project_manager_first_name: string | null
          project_manager_full_name: string | null
          project_manager_id: string | null
          project_manager_last_name: string | null
          project_name: string | null
          project_type: string | null
          project_type_name: string | null
          release_date: string | null
          sbu_head_email: string | null
          sbu_head_name: string | null
          sbu_name: string | null
          search_text: string | null
          updated_at: string | null
          weekly_validation: boolean | null
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
            foreignKeyName: "profiles_expertise_fkey"
            columns: ["expertise_id"]
            isOneToOne: false
            referencedRelation: "expertise_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_fkey"
            columns: ["profile_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_fkey"
            columns: ["profile_manager_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profiles_sbu_id_fkey"
            columns: ["profile_sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_management_project_manager_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_management_project_manager_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "projects_management_project_type_fkey"
            columns: ["project_type"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_planning_bill_type_id_fkey"
            columns: ["bill_type_id"]
            isOneToOne: false
            referencedRelation: "bill_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_planning_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_planning_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "resource_planning_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_management"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_custom_role_to_user: {
        Args: {
          _assigned_by?: string
          _custom_role_id: string
          _sbu_context?: string
          _user_id: string
        }
        Returns: undefined
      }
      bulk_sync_odoo_employees: {
        Args: { employees_data: Json }
        Returns: Json
      }
      bulk_sync_odoo_projects: {
        Args: { projects_data: Json }
        Returns: Json
      }
      bulk_update_resource_planning: {
        Args: { updates_data: Json }
        Returns: Json
      }
      bulk_update_users: {
        Args: { users_data: Json }
        Returns: Json
      }
      calculate_experience_duration: {
        Args: { end_date: string; is_current: boolean; start_date: string }
        Returns: number
      }
      calculate_weekly_score_card: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      duplicate_custom_role: {
        Args: { new_role_name?: string; source_role_id: string }
        Returns: string
      }
      duplicate_resource_assignment: {
        Args: { assignment_id: string }
        Returns: Json
      }
      export_profile_json: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      get_active_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_bill_type_changes: {
        Args: {
          end_date_param?: string
          new_bill_type_ids?: string[]
          old_bill_type_ids?: string[]
          profile_ids?: string[]
          sbu_ids?: string[]
          start_date_param?: string
        }
        Returns: {
          career_start_date: string
          changed_at: string
          created_at: string
          date_of_joining: string
          email: string
          employee_id: string
          expertise_id: string
          expertise_name: string
          first_name: string
          id: string
          last_name: string
          manager_employee_id: string
          manager_id: string
          manager_name: string
          new_bill_type_id: string
          new_bill_type_name: string
          old_bill_type_id: string
          old_bill_type_name: string
          profile_id: string
          project_id: string
          project_name: string
          sbu_id: string
          sbu_name: string
        }[]
      }
      get_cron_job_executions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_cv_audit_history: {
        Args: { limit_records?: number; target_profile_id: string }
        Returns: {
          changed_at: string
          changed_by: string
          changed_by_name: string
          changed_fields: string[]
          id: string
          new_data: Json
          old_data: Json
          operation_type: string
          record_id: string
          table_name: string
        }[]
      }
      get_employee_data: {
        Args: {
          achievements_limit?: number
          education_limit?: number
          experiences_limit?: number
          profile_uuid: string
          projects_limit?: number
          specialized_skills_limit?: number
          technical_skills_limit?: number
          trainings_limit?: number
        }
        Returns: Json
      }
      get_employee_data_masked: {
        Args: {
          achievements_limit?: number
          education_limit?: number
          experiences_limit?: number
          profile_uuid: string
          projects_limit?: number
          specialized_skills_limit?: number
          technical_skills_limit?: number
          trainings_limit?: number
        }
        Returns: Json
      }
      get_employee_profile_v2: {
        Args: {
          achievement_filter?: string
          availability_status?: string
          current_project_search?: string
          education_filter?: string
          experience_filter?: string
          items_per_page?: number
          max_billing_percentage?: number
          max_engagement_percentage?: number
          max_experience_years?: number
          max_graduation_year?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          min_experience_years?: number
          min_graduation_year?: number
          page_number?: number
          project_filter?: string
          release_date_from?: string
          release_date_to?: string
          require_all_skills?: boolean
          search_query?: string
          skill_filter?: string
          sort_by?: string
          sort_order?: string
          training_filter?: string
        }
        Returns: Json
      }
      get_employee_profiles: {
        Args: {
          achievement_filter?: string
          availability_status?: string
          completion_status?: string
          current_project_search?: string
          education_filter?: string
          experience_filter?: string
          items_per_page?: number
          max_billing_percentage?: number
          max_engagement_percentage?: number
          max_experience_years?: number
          max_graduation_year?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          min_experience_years?: number
          min_graduation_year?: number
          page_number?: number
          project_filter?: string
          release_date_from?: string
          release_date_to?: string
          search_query?: string
          skill_filter?: string
          sort_by?: string
          sort_order?: string
          training_filter?: string
        }
        Returns: Json
      }
      get_experience_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          range: string
        }[]
      }
      get_experiences_by_company: {
        Args: { profile_uuid: string }
        Returns: Json
      }
      get_incomplete_cv_profiles_paginated: {
        Args: {
          page_number?: number
          page_size?: number
          resource_type_filter?: string
          search_term?: string
        }
        Returns: Json
      }
      get_non_billed_pivot_statistics_with_grouping: {
        Args: {
          bill_type_filter?: string
          enable_grouping?: boolean
          end_date_filter?: string
          expertise_type_filter?: string
          primary_dimension?: string
          sbu_filter?: string
          secondary_dimension?: string
          start_date_filter?: string
        }
        Returns: Json
      }
      get_non_billed_resources_dimensional_analysis: {
        Args: {
          bench_filter?: boolean
          end_date_filter?: string
          group_by_dimension?: string
          start_date_filter?: string
        }
        Returns: Json
      }
      get_non_billed_resources_overview_statistics: {
        Args: {
          bench_filter?: boolean
          bill_type_filter?: string[]
          end_date_filter?: string
          expertise_filter?: string[]
          sbu_filter?: string[]
          start_date_filter?: string
        }
        Returns: {
          experience_distribution: Json
          overview: Json
          recent_trends: Json
          sbu_experience_distribution: Json
        }[]
      }
      get_non_billed_resources_risk_analytics: {
        Args: { bench_filter?: boolean; risk_threshold_days?: number }
        Returns: Json
      }
      get_non_billed_resources_sbu_dimensional_analysis: {
        Args: {
          bench_filter?: boolean
          end_date_filter?: string
          start_date_filter?: string
        }
        Returns: Json
      }
      get_non_billed_resources_trends_analysis: {
        Args: {
          bench_filter?: boolean
          lookback_days?: number
          period_type?: string
        }
        Returns: Json
      }
      get_non_billed_sync_cron_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_pip_profile_details: {
        Args: { input_pip_id: string }
        Returns: Json
      }
      get_planned_resource_calendar_data: {
        Args: {
          bill_type_filter?: string
          end_date_from?: string
          end_date_to?: string
          expertise_filter?: string
          items_per_page?: number
          manager_filter?: string
          max_billing_percentage?: number
          max_engagement_percentage?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          page_number?: number
          project_bill_type_filter?: string
          project_level_filter?: string
          project_search?: string
          project_type_filter?: string
          sbu_filter?: string
          search_query?: string
          sort_by?: string
          sort_order?: string
          start_date_from?: string
          start_date_to?: string
        }
        Returns: Json
      }
      get_planned_resource_data: {
        Args: {
          bill_type_filter?: string
          end_date_from?: string
          end_date_to?: string
          expertise_filter?: string
          items_per_page?: number
          manager_filter?: string
          max_billing_percentage?: number
          max_engagement_percentage?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          page_number?: number
          project_bill_type_filter?: string
          project_level_filter?: string
          project_search?: string
          project_type_filter?: string
          sbu_filter?: string
          search_query?: string
          sort_by?: string
          sort_order?: string
          start_date_from?: string
          start_date_to?: string
        }
        Returns: Json
      }
      get_profile_completion_by_resource_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_profiles: number
          completion_rate: number
          incomplete_profiles: number
          resource_type_id: string
          resource_type_name: string
          total_profiles: number
        }[]
      }
      get_profile_completion_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_completion_rate: number
          profiles_above_50_percent: number
          profiles_above_75_percent: number
          resource_type_breakdown: Json
          total_profiles: number
        }[]
      }
      get_profile_counts_by_resource_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_count: number
          resource_type_id: string
          resource_type_name: string
        }[]
      }
      get_profile_details_for_pip: {
        Args: { input_profile_id: string }
        Returns: {
          current_designation: string
          employee_id: string
          expertise_name: string
          first_name: string
          id: string
          last_name: string
          manager_id: string
          manager_name: string
          profile_image: string
          resource_planning: Json
          sbu_name: string
          total_utilization: number
        }[]
      }
      get_profile_relations: {
        Args: { target_id: string }
        Returns: Json
      }
      get_public_tables: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_recent_cv_changes: {
        Args: { limit_records?: number }
        Returns: {
          changed_at: string
          changed_by: string
          changed_by_name: string
          changed_fields: string[]
          id: string
          operation_type: string
          profile_id: string
          profile_name: string
          record_id: string
          table_name: string
        }[]
      }
      get_resource_changes_summary: {
        Args: { end_date_param?: string; start_date_param?: string }
        Returns: Json
      }
      get_resource_count_statistics: {
        Args: {
          bill_type_filter?: string
          expertise_type_filter?: string
          resource_type_filter?: string
          sbu_filter?: string
        }
        Returns: Json
      }
      get_resource_pivot_statistics_with_grouping: {
        Args: {
          bill_type_filter?: string
          enable_grouping?: boolean
          end_date_filter?: string
          expertise_type_filter?: string
          primary_dimension?: string
          resource_type_filter?: string
          sbu_filter?: string
          secondary_dimension?: string
          start_date_filter?: string
        }
        Returns: Json
      }
      get_sbu_billing_metrics: {
        Args: {
          end_date_filter?: string
          sbu_filter?: string
          start_date_filter?: string
        }
        Returns: Json
      }
      get_sbu_changes: {
        Args: {
          end_date_param?: string
          new_sbu_ids?: string[]
          old_sbu_ids?: string[]
          profile_ids?: string[]
          start_date_param?: string
        }
        Returns: {
          changed_at: string
          created_at: string
          employee_id: string
          first_name: string
          id: string
          last_name: string
          new_sbu_id: string
          new_sbu_name: string
          old_sbu_id: string
          old_sbu_name: string
          profile_id: string
        }[]
      }
      get_sbu_summary_stats: {
        Args: { sbu_filter?: string }
        Returns: {
          active_projects: number
          avg_engagement_percentage: number
          total_resources: number
        }[]
      }
      get_skill_matrix: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          skill: string
        }[]
      }
      get_unplanned_resources: {
        Args: {
          items_per_page?: number
          manager_filter?: string
          page_number?: number
          sbu_filter?: string
          search_query?: string
        }
        Returns: Json
      }
      get_user_accessible_sbus: {
        Args: { search_query?: string; target_user_id?: string }
        Returns: Json
      }
      get_user_audit_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          allowed_sbus: string[]
          is_sbu_bound: boolean
          module_name: string
          permission_type: Database["public"]["Enums"]["permission_type_enum"]
          role_name: string
          route_path: string
          sub_module_name: string
          table_names: string[]
        }[]
      }
      get_weekly_score_card_cron_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_weekly_validation_cron_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_weekly_validation_data: {
        Args: {
          bill_type_filter?: string
          end_date_from?: string
          end_date_to?: string
          expertise_filter?: string
          items_per_page?: number
          manager_filter?: string
          max_billing_percentage?: number
          max_engagement_percentage?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          page_number?: number
          project_bill_type_filter?: string
          project_level_filter?: string
          project_search?: string
          project_type_filter?: string
          sbu_filter?: string
          search_query?: string
          sort_by?: string
          sort_order?: string
          start_date_from?: string
          start_date_to?: string
        }
        Returns: Json
      }
      has_any_role: {
        Args: { roles: string[] }
        Returns: boolean
      }
      has_module_access: {
        Args: { _module_name: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          _permission_type: Database["public"]["Enums"]["permission_type_enum"]
          _sub_module_path: string
          _table_name?: string
          _target_sbu_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { _role: string } | { _role: string; _user_id: string }
        Returns: boolean
      }
      has_table_access: {
        Args: {
          _permission_type?: Database["public"]["Enums"]["permission_type_enum"]
          _table_name: string
          _target_sbu_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      import_profile_json: {
        Args: { profile_data: Json; target_user_id?: string }
        Returns: Json
      }
      insert_pip_pm_feedback: {
        Args: {
          p_behavioral_areas: string[]
          p_behavioral_gap_description: string
          p_behavioral_gap_example: string
          p_created_by: string
          p_pip_id: string
          p_skill_areas: string[]
          p_skill_gap_description: string
          p_skill_gap_example: string
        }
        Returns: string
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
      is_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_system_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_non_billed_resources: {
        Args: {
          bill_type_filter?: string[]
          expertise_filter?: string[]
          items_per_page?: number
          page_number?: number
          sbu_filter?: string[]
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      list_users: {
        Args: {
          filter_custom_role_id?: string
          filter_expertise_id?: string
          filter_manager_id?: string
          filter_max_company_years?: number
          filter_max_total_years?: number
          filter_min_company_years?: number
          filter_min_total_years?: number
          filter_resource_type_id?: string
          filter_sbu_id?: string
          items_per_page?: number
          page_number?: number
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      manage_non_billed_sync_cron: {
        Args: { p_enabled: boolean; p_schedule: string }
        Returns: Json
      }
      manage_weekly_score_card_cron: {
        Args: { p_enabled: boolean; p_schedule: string }
        Returns: Json
      }
      manage_weekly_validation_cron: {
        Args: { p_enabled: boolean; p_schedule: string }
        Returns: Json
      }
      reset_weekly_validation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_certifications: {
        Args: {
          items_per_page?: number
          page_number?: number
          provider_filter?: string
          sbu_filter?: string
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_degrees: {
        Args: {
          items_per_page?: number
          page_number?: number
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_departments: {
        Args: {
          items_per_page?: number
          page_number?: number
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_pips: {
        Args: {
          designation_filter?: string
          expertise_filter?: string
          items_per_page?: number
          manager_filter?: string
          page_number?: number
          sbu_filter?: string
          search_query?: string
          sort_by?: string
          sort_order?: string
          status_filter?: string
        }
        Returns: Json
      }
      search_projects: {
        Args: {
          budget_max?: number
          budget_min?: number
          created_after?: string
          created_before?: string
          items_per_page?: number
          page_number?: number
          project_level_filter?: string
          project_manager_filter?: string
          project_type_filter?: string
          search_query?: string
          show_inactive_projects?: boolean
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_references: {
        Args: {
          items_per_page?: number
          page_number?: number
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_resource_planning_audit_logs: {
        Args: {
          bill_type_filter?: string
          date_from?: string
          date_to?: string
          employee_id_filter?: string
          forecasted_project_filter?: string
          items_per_page?: number
          operation_type_filter?: string
          page_number?: number
          project_name_filter?: string
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      search_universities: {
        Args: {
          items_per_page?: number
          page_number?: number
          search_query?: string
          sort_by?: string
          sort_order?: string
          type_filter?: string
        }
        Returns: Json
      }
      sync_non_billed_resources_now: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_non_billed_resources_feedback: {
        Args: { employee_id_param: string; feedback_param: string }
        Returns: Json
      }
      update_pip_pm_feedback: {
        Args: {
          p_behavioral_areas?: string[]
          p_behavioral_gap_description?: string
          p_behavioral_gap_example?: string
          p_feedback_id: string
          p_skill_areas?: string[]
          p_skill_gap_description?: string
          p_skill_gap_example?: string
        }
        Returns: string
      }
      user_has_create_permission: {
        Args: { _table_name?: string; _user_id?: string }
        Returns: boolean
      }
      user_has_delete_permission: {
        Args: { _table_name?: string; _user_id?: string }
        Returns: boolean
      }
      user_has_read_permission: {
        Args: { _table_name?: string; _user_id?: string }
        Returns: boolean
      }
      user_has_table_permission: {
        Args: {
          _permission_type: string
          _table_name: string
          _user_id: string
        }
        Returns: boolean
      }
      user_has_update_permission: {
        Args: { _table_name?: string; _user_id?: string }
        Returns: boolean
      }
      validate_custom_role_assignment: {
        Args: { _custom_role_id: string; _sbu_context?: string }
        Returns: boolean
      }
    }
    Enums: {
      permission_type_enum: "read" | "write" | "update" | "delete"
      pip_status_enum:
        | "hr_initiation"
        | "pm_feedback"
        | "hr_review"
        | "ld_goal_setting"
        | "mid_review"
        | "final_review"
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
    Enums: {
      permission_type_enum: ["read", "write", "update", "delete"],
      pip_status_enum: [
        "hr_initiation",
        "pm_feedback",
        "hr_review",
        "ld_goal_setting",
        "mid_review",
        "final_review",
      ],
    },
  },
} as const
