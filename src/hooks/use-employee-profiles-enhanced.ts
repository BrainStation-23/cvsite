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
    is_renewable?: boolean;
    expiry_date?: string;
    certificate_url?: string;
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

export type EmployeeProfileSortColumn = 'first_name' | 'last_name' | 'employee_id' | 'created_at' | 'updated_at';

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
      sortBy: sortField = sortBy,
      sortOrder: sortDir = sortOrder
    } = options;

    setIsLoading(true);

    try {
      console.log('Fetching profiles with params:', {
        search_query: search,
        skill_filter: skillF,
        experience_filter: expF,
        education_filter: eduF,
        training_filter: trainF,
        achievement_filter: achF,
        project_filter: projF,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortField,
        sort_order: sortDir
      });

      const { data, error } = await supabase.rpc('get_employee_profiles', {
        search_query: search,
        skill_filter: skillF,
        experience_filter: expF,
        education_filter: eduF,
        training_filter: trainF,
        achievement_filter: achF,
        project_filter: projF,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortField,
        sort_order: sortDir
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Raw RPC Response:', data);

      if (data) {
        // The new RPC function returns data in a specific format
        const responseData = data as unknown as EmployeeProfilesResponse;
        console.log('Parsed response data:', responseData);
        
        let profilesData = responseData.profiles || [];
        const paginationData = responseData.pagination;

        // Ensure each profile has the expected structure
        profilesData = profilesData.map((profile: any) => {
          // Handle cases where profile might be wrapped in additional structure
          const actualProfile = profile.profile_data || profile;
          
          return {
            ...actualProfile,
            // Ensure technical_skills and specialized_skills are arrays, not null
            technical_skills: actualProfile.technical_skills || [],
            specialized_skills: actualProfile.specialized_skills || [],
            trainings: actualProfile.trainings || [],
            // Ensure general_information exists
            general_information: actualProfile.general_information || {
              first_name: actualProfile.first_name || '',
              last_name: actualProfile.last_name || '',
              biography: null,
              profile_image: null,
              current_designation: null
            }
          };
        });

        console.log('Processed profiles data:', profilesData);

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
