
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  EmployeeProfile, 
  EmployeeProfilesPagination, 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder,
  EmployeeProfilesResponse 
} from './types/employee-profiles';

interface UseEmployeeProfilesProps {
  initialPage?: number;
  initialPerPage?: number;
}

export function useEmployeeProfiles({ 
  initialPage = 1, 
  initialPerPage = 10 
}: UseEmployeeProfilesProps = {}) {
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<EmployeeProfilesPagination>({
    totalCount: 0,
    filteredCount: 0,
    page: initialPage,
    perPage: initialPerPage,
    pageCount: 0
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [experienceFilter, setExperienceFilter] = useState<string>('');
  const [educationFilter, setEducationFilter] = useState<string>('');
  const [trainingFilter, setTrainingFilter] = useState<string>('');
  const [achievementFilter, setAchievementFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<EmployeeProfileSortColumn>('last_name');
  const [sortOrder, setSortOrder] = useState<EmployeeProfileSortOrder>('asc');

  const fetchProfiles = async (options: {
    page?: number;
    perPage?: number;
    search?: string;
    skillFilter?: string;
    experienceFilter?: string;
    educationFilter?: string;
    trainingFilter?: string;
    achievementFilter?: string;
    projectFilter?: string;
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
    sortColumn?: EmployeeProfileSortColumn;
    sortDirection?: EmployeeProfileSortOrder;
  } = {}) => {
    const {
      page = pagination.page,
      perPage = pagination.perPage,
      search = searchQuery,
      skillFilter: skills = skillFilter,
      experienceFilter: experience = experienceFilter,
      educationFilter: education = educationFilter,
      trainingFilter: training = trainingFilter,
      achievementFilter: achievement = achievementFilter,
      projectFilter: project = projectFilter,
      minExperienceYears = null,
      maxExperienceYears = null,
      minGraduationYear = null,
      maxGraduationYear = null,
      completionStatus = null,
      sortColumn = sortBy,
      sortDirection = sortOrder
    } = options;

    setIsLoading(true);

    try {
      console.log('Fetching employee profiles with filters:', {
        search,
        skills,
        experience,
        education,
        training,
        achievement,
        project,
        minExperienceYears,
        maxExperienceYears,
        minGraduationYear,
        maxGraduationYear,
        completionStatus,
        page,
        perPage,
        sortColumn,
        sortDirection
      });

      const { data, error } = await supabase.rpc('get_employee_profiles', {
        search_query: search || null,
        skill_filter: skills || null,
        experience_filter: experience || null,
        education_filter: education || null,
        training_filter: training || null,
        achievement_filter: achievement || null,
        project_filter: project || null,
        min_experience_years: minExperienceYears,
        max_experience_years: maxExperienceYears,
        min_graduation_year: minGraduationYear,
        max_graduation_year: maxGraduationYear,
        completion_status: completionStatus,
        page_number: page,
        items_per_page: perPage,
        sort_by: sortColumn,
        sort_order: sortDirection
      });

      if (error) {
        console.error('Error fetching employee profiles:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned from get_employee_profiles RPC');
        throw new Error('No data returned from server');
      }

      console.log('Employee profiles response:', data);

      const response = data as unknown as EmployeeProfilesResponse;
      
      setProfiles(response.profiles || []);
      
      // Map the response pagination properties to match our interface
      const mappedPagination: EmployeeProfilesPagination = {
        totalCount: response.pagination.total_count,
        filteredCount: response.pagination.filtered_count,
        page: response.pagination.page,
        perPage: response.pagination.per_page,
        pageCount: response.pagination.page_count
      };
      
      setPagination(mappedPagination);
      
      // Update state with the query parameters
      setSearchQuery(search);
      setSkillFilter(skills);
      setExperienceFilter(experience);
      setEducationFilter(education);
      setTrainingFilter(training);
      setAchievementFilter(achievement);
      setProjectFilter(project);
      setSortBy(sortColumn);
      setSortOrder(sortDirection);

    } catch (error) {
      console.error('Error fetching employee profiles:', error);
      toast({
        title: 'Error fetching employee profiles',
        description: error.message || 'There was an error fetching employee profiles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchProfiles({ page: newPage });
  };

  const handleSearch = (query: string) => {
    fetchProfiles({ 
      page: 1, 
      search: query 
    });
  };

  const handleSkillFilter = (skill: string) => {
    fetchProfiles({ 
      page: 1, 
      skillFilter: skill 
    });
  };

  const handleExperienceFilter = (experience: string) => {
    fetchProfiles({ 
      page: 1, 
      experienceFilter: experience 
    });
  };

  const handleEducationFilter = (education: string) => {
    fetchProfiles({ 
      page: 1, 
      educationFilter: education 
    });
  };

  const handleTrainingFilter = (training: string) => {
    fetchProfiles({ 
      page: 1, 
      trainingFilter: training 
    });
  };

  const handleAchievementFilter = (achievement: string) => {
    fetchProfiles({ 
      page: 1, 
      achievementFilter: achievement 
    });
  };

  const handleProjectFilter = (project: string) => {
    fetchProfiles({ 
      page: 1, 
      projectFilter: project 
    });
  };

  const handleSortChange = (column: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => {
    fetchProfiles({ 
      sortColumn: column, 
      sortDirection: order 
    });
  };

  const handleAdvancedFilters = (filters: {
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
  }) => {
    fetchProfiles({ 
      page: 1,
      ...filters
    });
  };

  const resetFilters = () => {
    fetchProfiles({
      page: 1,
      search: '',
      skillFilter: '',
      experienceFilter: '',
      educationFilter: '',
      trainingFilter: '',
      achievementFilter: '',
      projectFilter: '',
      minExperienceYears: null,
      maxExperienceYears: null,
      minGraduationYear: null,
      maxGraduationYear: null,
      completionStatus: null,
      sortColumn: 'last_name',
      sortDirection: 'asc'
    });
  };

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
