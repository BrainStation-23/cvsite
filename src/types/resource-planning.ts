
export interface AdvancedFilters {
  sbuFilter: string;
  managerFilter: string;
  billTypeFilter: string;
  projectSearch: string;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
  projectLevelFilter: string;
  projectBillTypeFilter: string;
}

export interface ResourcePlanningFilters extends AdvancedFilters {
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
