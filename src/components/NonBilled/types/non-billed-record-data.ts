export interface NonBilledRecord {
  employee_id: string | null;
  employee_name: string;
  expertise: string | null;
  expertise_id: string | null;
  sbu_id: string | null;
  sbu_name: string | null;
  total_years_experience: number | null;
  bill_type_id: string | null;
  bill_type_name: string | null;
  bill_type_color: string | null;
  non_billed_resources_date: string;
  non_billed_resources_duration_days: number;
  planned_status: string | null;
  non_billed_resources_id: string;
  non_billed_resources_feedback: string | null;
  profile_id: string;
}

export interface NonBilledPagination {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

export interface NonBilledResponse {
  non_billed_resources_records: NonBilledRecord[];
  pagination: NonBilledPagination;
}

export interface NonBilledRpcParams {
  search_query: string | null;
  page_number: number;
  items_per_page: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  sbu_filter: string[] | null;
  expertise_filter: string[] | null;
  bill_type_filter: string[] | null;
}
