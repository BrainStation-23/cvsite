export interface NonBilledRecord {
  employee_id: string;
  employee_name: string;
  expertise_id: string;
  expertise: string;
  sbu_id: string;
  sbu_name: string;
  total_years_experience: number;
  bill_type_id: string;
  bill_type_name: string;
  bill_type_color: string;
  non_billed_resources_date: string;
  non_billed_resources_duration_days: number;
  planned_status: 'planned' | 'unplanned';
  non_billed_resources_feedback: string | null;
  profile_id: string;
}