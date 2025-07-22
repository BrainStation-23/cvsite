
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeProfile {
  id: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  date_of_joining?: string;
  career_start_date?: string;
  expertise_id?: string;
  expertise_name?: string;
  total_experience_years?: number;
  company_experience_years?: number;
  general_information?: {
    first_name: string;
    last_name: string;
    biography?: string;
    profile_image?: string;
    current_designation?: string;
  };
  technical_skills?: Array<{
    id: string;
    name: string;
    proficiency: number;
    priority: number;
  }>;
  specialized_skills?: Array<{
    id: string;
    name: string;
    proficiency: number;
  }>;
  trainings?: Array<{
    id: string;
    title: string;
    provider: string;
    certification_date: string;
    description?: string;
    certificate_url?: string;
  }>;
  experiences?: Array<{
    id: string;
    company_name: string;
    designation: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
  }>;
  education?: Array<{
    id: string;
    university: string;
    degree?: string;
    department?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    gpa?: string;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    date: string;
    description: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    role: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description: string;
    responsibility?: string;
    technologies_used?: string[];
    url?: string;
    display_order?: number;
  }>;
}

interface PaginationData {
  totalCount: number;
  filteredCount: number;
  page: number;
  perPage: number;
  pageCount: number;
}

interface EmployeeProfilesResponse {
  profiles: EmployeeProfile[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export type EmployeeProfileSortColumn = 'first_name' | 'last_name' | 'employee_id' | 'created_at' | 'updated_at' | 'total_experience' | 'company_experience';

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
  const [minExperienceYears, setMinExperienceYears] = useState<number | null>(null);
  const [maxExperienceYears, setMaxExperienceYears] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<EmployeeProfileSortColumn>('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    sortBy?: EmployeeProfileSortColumn;
    sortOrder?: 'asc' | 'desc';
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
      minExperienceYears: minExp = minExperienceYears,
      maxExperienceYears: maxExp = maxExperienceYears,
      sortBy: sortField = sortBy,
      sortOrder: sortDir = sortOrder
    } = options;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('get_employee_profiles', {
        search_query: search,
        skill_filter: skillF,
        experience_filter: expF,
        education_filter: eduF,
        training_filter: trainF,
        achievement_filter: achF,
        project_filter: projF,
        min_experience_years: minExp,
        max_experience_years: maxExp,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortField,
        sort_order: sortDir
      });

      if (error) throw error;

      if (data) {
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
        setMinExperienceYears(minExp);
        setMaxExperienceYears(maxExp);
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
  }, [pagination.page, pagination.perPage, searchQuery, skillFilter, experienceFilter, educationFilter, trainingFilter, achievementFilter, projectFilter, minExperienceYears, maxExperienceYears, sortBy, sortOrder, toast]);

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

  const handleExperienceYearsFilter = useCallback((min: number | null, max: number | null) => {
    fetchProfiles({ minExperienceYears: min, maxExperienceYears: max, page: 1 });
  }, [fetchProfiles]);

  const handleSortChange = useCallback((field: EmployeeProfileSortColumn, order: 'asc' | 'desc') => {
    fetchProfiles({ sortBy: field, sortOrder: order });
  }, [fetchProfiles]);

  const handleAdvancedFilters = useCallback((filters: any) => {
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
    minExperienceYears,
    maxExperienceYears,
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
    handleExperienceYearsFilter,
    handleSortChange,
    handleAdvancedFilters,
    resetFilters
  };
}
