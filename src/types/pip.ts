
export interface PIP {
  pip_id: string;
  profile_id: string;
  overall_feedback: string | null;
  start_date: string;
  mid_date: string | null;
  end_date: string;
  final_review: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_id: string;
  designation: string | null;
  profile_image: string | null;
  sbu_name: string | null;
  sbu_id: string | null;
  expertise_name: string | null;
  expertise_id: string | null;
  manager_name: string | null;
  manager_id: string | null;
}

export interface PIPFormData {
  profile_id: string;
  overall_feedback: string;
  start_date: string;
  mid_date?: string;
  end_date: string;
  final_review?: string;
}

export interface ProfileDetails {
  id: string;
  first_name: string | null;
  last_name: string | null;
  employee_id: string | null;
  sbu_name: string | null;
  expertise_name: string | null;
  manager_name: string | null;
  current_designation: string | null;
}
