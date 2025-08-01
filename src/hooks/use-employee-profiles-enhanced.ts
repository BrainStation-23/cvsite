import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  EmployeeProfile, 
  EmployeeProfilesPagination, 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder,
  EmployeeProfilesResponse 
} from './types/employee-profiles';

interface PaginationData {
  totalCount: number;
  filteredCount: number;
  page: number;
  perPage: number;
  pageCount: number;
}

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export function useEmployeeProfilesEnhanced() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    filteredCount: 0,
    page: 1,
    perPage: 10,
    pageCount: 0
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string | null>(null);
  const [educationFilter, setEducationFilter] = useState<string | null>(null);
  const [trainingFilter, setTrainingFilter] = useState<string | null>(null);
  const [achievementFilter, setAchievementFilter] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<EmployeeProfileSortColumn>('last_name');
  const [sortOrder, setSortOrder] = useState<EmployeeProfileSortOrder>('asc');

  // New resource planning filter states
  const [minEngagementPercentage, setMinEngagementPercentage] = useState<number | null>(null);
  const [maxEngagementPercentage, setMaxEngagementPercentage] = useState<number | null>(null);
  const [minBillingPercentage, setMinBillingPercentage] = useState<number | null>(null);
  const [maxBillingPercentage, setMaxBillingPercentage] = useState<number | null>(null);
  const [releaseDateFrom, setReleaseDateFrom] = useState<Date | null>(null);
  const [releaseDateTo, setReleaseDateTo] = useState<Date | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<string | null>(null);
  const [currentProjectSearch, setCurrentProjectSearch] = useState<string | null>(null);

  const fetchProfiles = useCallback(async (options: {
    page?: number;
    perPage?: number;
    search?: string | null;
    skillFilter?: string | null;
    experienceFilter?: string | null;
    educationFilter?: string | null;
    trainingFilter?: string | null;
    achievementFilter?: string | null;
    projectFilter?: string | null;
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
    // New resource planning parameters
    minEngagementPercentage?: number | null;
    maxEngagementPercentage?: number | null;
    minBillingPercentage?: number | null;
    maxBillingPercentage?: number | null;
    releaseDateFrom?: Date | null;
    releaseDateTo?: Date | null;
    availabilityStatus?: string | null;
    currentProjectSearch?: string | null;
    sortBy?: EmployeeProfileSortColumn;
    sortOrder?: EmployeeProfileSortOrder;
  } = {}) => {
    const {
      page = pagination.page,
      perPage = pagination.perPage,
      search = searchQuery,
      skillFilter: skillF = skillFilter,
      experienceFilter: expF = experienceFilter,
      educationFilter: eduF = educationFilter,
      trainingFilter: trainF = trainingFilter,
      achievementFilter: achF = achievementFilter,
      projectFilter: projF = projectFilter,
      minExperienceYears = null,
      maxExperienceYears = null,
      minGraduationYear = null,
      maxGraduationYear = null,
      completionStatus = null,
      // New parameters
      minEngagementPercentage: minEngPerc = minEngagementPercentage,
      maxEngagementPercentage: maxEngPerc = maxEngagementPercentage,
      minBillingPercentage: minBillPerc = minBillingPercentage,
      maxBillingPercentage: maxBillPerc = maxBillingPercentage,
      releaseDateFrom: relFrom = releaseDateFrom,
      releaseDateTo: relTo = releaseDateTo,
      availabilityStatus: avStatus = availabilityStatus,
      currentProjectSearch: projSearch = currentProjectSearch,
      sortBy: sortField = sortBy,
      sortOrder: sortDir = sortOrder
    } = options;

    setIsLoading(true);

    try {
      console.log('Fetching employee profiles with options:', {
        search, skillF, expF, eduF, trainF, achF, projF,
        minExperienceYears, maxExperienceYears, minGraduationYear, maxGraduationYear, completionStatus,
        minEngPerc, maxEngPerc, minBillPerc, maxBillPerc, relFrom, relTo, avStatus, projSearch,
        page, perPage, sortField, sortDir
      });

      // Add timeout handling for the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
      });

      const queryPromise = supabase.rpc('get_employee_profiles', {
        search_query: search,
        skill_filter: skillF,
        experience_filter: expF,
        education_filter: eduF,
        training_filter: trainF,
        achievement_filter: achF,
        project_filter: projF,
        min_experience_years: minExperienceYears,
        max_experience_years: maxExperienceYears,
        min_graduation_year: minGraduationYear,
        max_graduation_year: maxGraduationYear,
        completion_status: completionStatus,
        // New resource planning parameters
        min_engagement_percentage: minEngPerc,
        max_engagement_percentage: maxEngPerc,
        min_billing_percentage: minBillPerc,
        max_billing_percentage: maxBillPerc,
        release_date_from: relFrom ? relFrom.toISOString().split('T')[0] : null,
        release_date_to: relTo ? relTo.toISOString().split('T')[0] : null,
        availability_status: avStatus,
        current_project_search: projSearch,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortField,
        sort_order: sortDir
      });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching employee profiles:', error);
        throw error;
      }

      if (data) {
        console.log('Employee profiles response:', data);
        
        const responseData = data as unknown as EmployeeProfilesResponse;
        const profilesData = responseData.profiles || [];
        const paginationData = responseData.pagination;

        setProfiles(profilesData);
        setPagination({
          totalCount: paginationData?.total_count || 0,
          filteredCount: paginationData?.filtered_count || 0,
          page: paginationData?.page || 1,
          perPage: paginationData?.per_page || 10,
          pageCount: paginationData?.page_count || 0
        });

        // Update filter states
        setSearchQuery(search);
        setSkillFilter(skillF);
        setExperienceFilter(expF);
        setEducationFilter(eduF);
        setTrainingFilter(trainF);
        setAchievementFilter(achF);
        setProjectFilter(projF);
        setMinEngagementPercentage(minEngPerc);
        setMaxEngagementPercentage(maxEngPerc);
        setMinBillingPercentage(minBillPerc);
        setMaxBillingPercentage(maxBillPerc);
        setReleaseDateFrom(relFrom);
        setReleaseDateTo(relTo);
        setAvailabilityStatus(avStatus);
        setCurrentProjectSearch(projSearch);
        setSortBy(sortField);
        setSortOrder(sortDir);
      }
    } catch (error: any) {
      console.error('Error fetching employee profiles:', error);
      
      // Enhanced error handling for different error types
      let errorMessage = 'There was an error fetching employee profiles';
      
      if (error.message?.includes('timeout') || error.code === '57014') {
        errorMessage = 'Database query timed out. Please try using filters to reduce the dataset size.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error fetching profiles',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Re-throw the error so the component can handle it
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchQuery, skillFilter, experienceFilter, educationFilter, trainingFilter, achievementFilter, projectFilter, minEngagementPercentage, maxEngagementPercentage, minBillingPercentage, maxBillingPercentage, releaseDateFrom, releaseDateTo, availabilityStatus, currentProjectSearch, sortBy, sortOrder, toast]);

  // Debounced search function to reduce query frequency
  const debouncedFetchProfiles = useCallback(
    debounce(fetchProfiles, 500),
    [fetchProfiles]
  );

  const handlePageChange = useCallback((newPage: number) => {
    fetchProfiles({ page: newPage });
  }, [fetchProfiles]);

  const handleSearch = useCallback((query: string) => {
    debouncedFetchProfiles({ search: query, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleSkillFilter = useCallback((skill: string) => {
    debouncedFetchProfiles({ skillFilter: skill, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleExperienceFilter = useCallback((experience: string) => {
    debouncedFetchProfiles({ experienceFilter: experience, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleEducationFilter = useCallback((education: string) => {
    debouncedFetchProfiles({ educationFilter: education, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleTrainingFilter = useCallback((training: string) => {
    debouncedFetchProfiles({ trainingFilter: training, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleAchievementFilter = useCallback((achievement: string) => {
    debouncedFetchProfiles({ achievementFilter: achievement, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleProjectFilter = useCallback((project: string) => {
    debouncedFetchProfiles({ projectFilter: project, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleSortChange = useCallback((field: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => {
    fetchProfiles({ sortBy: field, sortOrder: order });
  }, [fetchProfiles]);

  const handleAdvancedFilters = useCallback((filters: {
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
  }) => {
    debouncedFetchProfiles({ ...filters, page: 1 });
  }, [debouncedFetchProfiles]);

  const handleResourcePlanningFilters = useCallback((filters: {
    minEngagementPercentage?: number | null;
    maxEngagementPercentage?: number | null;
    minBillingPercentage?: number | null;
    maxBillingPercentage?: number | null;
    releaseDateFrom?: Date | null;
    releaseDateTo?: Date | null;
    availabilityStatus?: string | null;
    currentProjectSearch?: string | null;
  }) => {
    debouncedFetchProfiles({ ...filters, page: 1 });
  }, [debouncedFetchProfiles]);

  const resetFilters = useCallback(() => {
    fetchProfiles({
      search: null,
      skillFilter: null,
      experienceFilter: null,
      educationFilter: null,
      trainingFilter: null,
      achievementFilter: null,
      projectFilter: null,
      minExperienceYears: null,
      maxExperienceYears: null,
      minGraduationYear: null,
      maxGraduationYear: null,
      completionStatus: null,
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      releaseDateFrom: null,
      releaseDateTo: null,
      availabilityStatus: null,
      currentProjectSearch: null,
      sortBy: 'last_name',
      sortOrder: 'asc',
      page: 1
    });
  }, [fetchProfiles]);

  return {
    profiles,
    isLoading,
    pagination,
    searchQuery,
    skillFilter,
    experienceFilter,
    educationFilter,
    trainingFilter,
    achievementFilter,
    projectFilter,
    sortBy,
    sortOrder,
    minEngagementPercentage,
    maxEngagementPercentage,
    minBillingPercentage,
    maxBillingPercentage,
    releaseDateFrom,
    releaseDateTo,
    availabilityStatus,
    currentProjectSearch,
    fetchProfiles,
    handlePageChange,
    handleSearch,
    handleSkillFilter,
    handleExperienceFilter,
    handleEducationFilter,
    handleTrainingFilter,
    handleAchievementFilter,
    handleProjectFilter,
    handleSortChange,
    handleAdvancedFilters,
    handleResourcePlanningFilters,
    resetFilters
  };
}
