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
      bill_type_change_history: {
        Row: {
          changed_at: string
          created_at: string
          id: string
          new_bill_type_id: string | null
          old_bill_type_id: string | null
          project_id: string | null
        }
        Insert: {
          changed_at?: string
          created_at?: string
          id?: string
          new_bill_type_id?: string | null
          old_bill_type_id?: string | null
          project_id?: string | null
        }
        Update: {
          changed_at?: string
          created_at?: string
          id?: string
          new_bill_type_id?: string | null
          old_bill_type_id?: string | null
          project_id?: string | null
        }
        Relationships: []
      }
      bill_types: {
        Row: {
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
      cv_templates: {
        Row: {
          created_at: string
          enabled: boolean
          html_template: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          html_template: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          html_template?: string
          id?: string
          is_default?: boolean
          name?: string
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
          {
            foreignKeyName: "notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "resource_availability_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          career_start_date: string | null
          created_at: string
          date_of_birth: string | null
          date_of_joining: string | null
          email: string | null
          employee_id: string | null
          expertise: string | null
          first_name: string | null
          id: string
          last_name: string | null
          manager: string | null
          resource_type: string | null
          sbu_id: string | null
          updated_at: string
        }
        Insert: {
          career_start_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          email?: string | null
          employee_id?: string | null
          expertise?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          manager?: string | null
          resource_type?: string | null
          sbu_id?: string | null
          updated_at?: string
        }
        Update: {
          career_start_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          email?: string | null
          employee_id?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          manager?: string | null
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
          id: string
          is_active: boolean
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
          is_active?: boolean
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
          is_active?: boolean
          project_manager?: string | null
          project_name?: string
          project_type?: string | null
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
          bill_type_id: string | null
          billing_percentage: number | null
          created_at: string
          engagement_complete: boolean
          engagement_percentage: number | null
          engagement_start_date: string | null
          id: string
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
          profile_id?: string
          project_id?: string | null
          release_date?: string | null
          updated_at?: string
          weekly_validation?: boolean | null
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
            foreignKeyName: "resource_planning_bill_type_id_fkey"
            columns: ["bill_type_id"]
            isOneToOne: false
            referencedRelation: "bill_types"
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
        Relationships: []
      }
      sbus: {
        Row: {
          created_at: string
          id: string
          is_department: boolean | null
          name: string
          sbu_head_email: string | null
          sbu_head_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_department?: boolean | null
          name: string
          sbu_head_email?: string | null
          sbu_head_name?: string | null
          updated_at?: string
        }
        Update: {
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
      weekly_score_card: {
        Row: {
          billed_count: number
          created_at: string
          id: string
          jsonb_record: Json
          non_billed_count: number
          timestamp: string
          updated_at: string
          utilization_rate: number
        }
        Insert: {
          billed_count?: number
          created_at?: string
          id?: string
          jsonb_record: Json
          non_billed_count?: number
          timestamp?: string
          updated_at?: string
          utilization_rate?: number
        }
        Update: {
          billed_count?: number
          created_at?: string
          id?: string
          jsonb_record?: Json
          non_billed_count?: number
          timestamp?: string
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
    }
    Functions: {
      bulk_sync_odoo_employees: {
        Args: { employees_data: Json }
        Returns: Json
      }
      bulk_sync_odoo_projects: {
        Args: { projects_data: Json }
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
      export_profile_json: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      get_employee_data: {
        Args: { profile_uuid: string }
        Returns: Json
      }
      get_employee_data_masked: {
        Args: { profile_uuid: string }
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
      get_incomplete_cv_profiles: {
        Args: { resource_type_filter?: string }
        Returns: {
          completion_score: number
          employee_id: string
          first_name: string
          last_name: string
          missing_sections: string[]
          profile_id: string
          resource_type_id: string
          resource_type_name: string
          total_sections: number
        }[]
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
      get_planned_resource_data: {
        Args: {
          bill_type_filter?: string
          end_date_from?: string
          end_date_to?: string
          items_per_page?: number
          manager_filter?: string
          max_billing_percentage?: number
          max_engagement_percentage?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          page_number?: number
          project_search?: string
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
      get_resource_count_statistics: {
        Args: {
          bill_type_filter?: string
          end_date_filter?: string
          expertise_type_filter?: string
          resource_type_filter?: string
          sbu_filter?: string
          start_date_filter?: string
        }
        Returns: Json
      }
      get_resource_pivot_statistics: {
        Args: {
          bill_type_filter?: string
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
      get_sbu_summary_stats: {
        Args: { sbu_filter?: string }
        Returns: {
          active_projects: number
          avg_engagement_percentage: number
          total_resources: number
        }[]
      }
      get_section_fields: {
        Args: { section_type_param: string }
        Returns: {
          default_enabled: boolean
          default_mask_value: string
          default_masked: boolean
          default_order: number
          display_label: string
          field_name: string
          field_type: string
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
          items_per_page?: number
          manager_filter?: string
          max_billing_percentage?: number
          max_engagement_percentage?: number
          min_billing_percentage?: number
          min_engagement_percentage?: number
          page_number?: number
          project_search?: string
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
      has_role: {
        Args: { _role: string } | { _role: string; _user_id: string }
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
          filter_role?: string
          items_per_page?: number
          page_number?: number
          search_query?: string
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      manage_weekly_score_card_cron: {
        Args: { p_enabled: boolean; p_schedule: string }
        Returns: Json
      }
      manage_weekly_validation_cron: {
        Args: { p_enabled?: boolean; p_schedule?: string }
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
      search_projects: {
        Args: {
          items_per_page?: number
          page_number?: number
          search_query?: string
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
