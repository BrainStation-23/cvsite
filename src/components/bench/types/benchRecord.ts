export interface BenchRecord {
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
  bench_date: string;
  bench_duration_days: number;
  planned_status: 'planned' | 'unplanned';
  bench_feedback: string | null;
  profile_id: string;
}