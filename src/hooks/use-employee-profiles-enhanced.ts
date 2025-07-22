
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
      sortBy: sortField = sortBy,
      sortOrder: sortDir = sortOrder
    } = options;

    setIsLoading(true);

    try {
      console.log('Fetching employee profiles with options:', {
        search,
        skillF,
        expF,
        eduF,
        trainF,
        achF,
        projF,
        minExperienceYears,
        maxExperienceYears,
        minGraduationYear,
        maxGraduationYear,
        completionStatus,
        page,
        perPage,
        sortField,
        sortDir
      });

      const { data, error } = await supabase.rpc('get_employee_profiles', {
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
        page_number: page,
        items_per_page: perPage,
        sort_by: sortField,
        sort_order: sortDir
      });

      if (error) {
        console.error('Error fetching employee profiles:', error);
        throw error;
      }

      if (data) {
        console.log('Employee profiles response:', data);
        
        // Type cast the data with proper unknown conversion first
        const responseData = data as unknown as EmployeeProfilesResponse;
        const profilesData = responseData.profiles || [];
        const paginationData = responseData.pagination;

        // Keep the profiles data as-is from the RPC function
        // The RPC function already provides the correct structure
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
        setSortBy(sortField);
        setSortOrder(sortDir);
      }
    } catch (error) {
      console.error('Error fetching employee profiles:', error);
      toast({
        title: 'Error fetching profiles',
        description: error.message || 'There was an error fetching employee profiles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchQuery, skillFilter, experienceFilter, educationFilter, trainingFilter, achievementFilter, projectFilter, sortBy, sortOrder, toast]);

  const handlePageChange = useCallback((newPage: number) => {
    fetchProfiles({ page: newPage });
  }, [fetchProfiles]);

  const handleSearch = useCallback((query: string) => {
    fetchProfiles({ search: query, page: 1 });
  }, [fetchProfiles]);

  const handleSkillFilter = useCallback((skill: string) => {
    fetchProfiles({ skillFilter: skill, page: 1 });
  }, [fetchProfiles]);

  const handleExperienceFilter = useCallback((experience: string) => {
    fetchProfiles({ experienceFilter: experience, page: 1 });
  }, [fetchProfiles]);

  const handleEducationFilter = useCallback((education: string) => {
    fetchProfiles({ educationFilter: education, page: 1 });
  }, [fetchProfiles]);

  const handleTrainingFilter = useCallback((training: string) => {
    fetchProfiles({ trainingFilter: training, page: 1 });
  }, [fetchProfiles]);

  const handleAchievementFilter = useCallback((achievement: string) => {
    fetchProfiles({ achievementFilter: achievement, page: 1 });
  }, [fetchProfiles]);

  const handleProjectFilter = useCallback((project: string) => {
    fetchProfiles({ projectFilter: project, page: 1 });
  }, [fetchProfiles]);

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
    fetchProfiles({ ...filters, page: 1 });
  }, [fetchProfiles]);

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
    resetFilters
  };
}
