import React from 'react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import CompactSearchHeader from './CompactSearchHeader';
import VerticalFilterChips from './VerticalFilterChips';
import CollapsibleFilterSection from './CollapsibleFilterSection';
import ResourcePlanningFilters from './ResourcePlanningFilters';
import { useFilterState } from '../FilterState';
import { useFilterChipsManager } from '../FilterChipsManager';
import { useAdvancedFiltersManager } from '../AdvancedFiltersManager';
import { useVerticalSidebarState } from './hooks/useVerticalSidebarState';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';

interface VerticalEmployeeSearchSidebarProps {
  onSearch: (query: string) => void;
  onSkillFilter: (skill: string) => void;
  onExperienceFilter: (experience: string) => void;
  onEducationFilter: (education: string) => void;
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
  onProjectFilter: (project: string) => void;
  onAdvancedFilters: (filters: {
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
  }) => void;
  onResourcePlanningFilters: (filters: {
    minEngagementPercentage?: number | null;
    maxEngagementPercentage?: number | null;
    minBillingPercentage?: number | null;
    maxBillingPercentage?: number | null;
    releaseDateFrom?: Date | null;
    releaseDateTo?: Date | null;
    availabilityStatus?: string | null;
    currentProjectSearch?: string | null;
  }) => void;
  onSortChange: (column: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => void;
  onReset: () => void;
  searchQuery: string;
  skillFilter: string;
  experienceFilter: string;
  educationFilter: string;
  trainingFilter: string;
  achievementFilter: string;
  projectFilter: string;
  sortBy: EmployeeProfileSortColumn;
  sortOrder: EmployeeProfileSortOrder;
  isLoading: boolean;
}

const VerticalEmployeeSearchSidebar: React.FC<VerticalEmployeeSearchSidebarProps> = ({
  onSearch,
  onSkillFilter,
  onExperienceFilter,
  onEducationFilter,
  onTrainingFilter,
  onAchievementFilter,
  onProjectFilter,
  onAdvancedFilters,
  onResourcePlanningFilters,
  onSortChange,
  onReset,
  searchQuery,
  skillFilter,
  experienceFilter,
  educationFilter,
  trainingFilter,
  achievementFilter,
  projectFilter,
  sortBy,
  sortOrder,
  isLoading
}) => {
  const {
    searchMode,
    setSearchMode,
    experienceYears,
    setExperienceYears,
    minGraduationYear,
    setMinGraduationYear,
    maxGraduationYear,
    setMaxGraduationYear,
    completionStatus,
    setCompletionStatus,
    skillInput,
    setSkillInput,
    universityInput,
    setUniversityInput,
    companyInput,
    setCompanyInput,
    technologyInput,
    setTechnologyInput,
    projectNameInput,
    setProjectNameInput,
    projectDescriptionInput,
    setProjectDescriptionInput,
    trainingInput,
    setTrainingInput,
    achievementInput,
    setAchievementInput,
    highlightedFilters,
    setHighlightedFilters,
  } = useVerticalSidebarState();

  const resourcePlanningState = useResourcePlanningState({ onResourcePlanningFilters });

  const { activeFilters } = useFilterState({
    searchQuery,
    skillFilter,
    experienceFilter,
    educationFilter,
    trainingFilter,
    achievementFilter,
    projectFilter,
    experienceYears,
    minGraduationYear,
    maxGraduationYear,
    completionStatus,
    skillInput,
    universityInput,
    companyInput,
    technologyInput,
    projectNameInput,
    projectDescriptionInput,
    trainingInput,
    achievementInput
  });

  const { removeFilter } = useFilterChipsManager({
    activeFilters,
    experienceYears,
    minGraduationYear,
    maxGraduationYear,
    completionStatus,
    onSearch,
    onSkillFilter,
    onExperienceFilter,
    onEducationFilter,
    onTrainingFilter,
    onAchievementFilter,
    onProjectFilter,
    onAdvancedFilters,
    setExperienceYears,
    setMinGraduationYear,
    setMaxGraduationYear,
    setCompletionStatus,
    setSkillInput,
    setUniversityInput,
    setCompanyInput,
    setTechnologyInput,
    setProjectNameInput,
    setProjectDescriptionInput,
    setTrainingInput,
    setAchievementInput,
    technologyInput
  });

  const { clearAllFilters } = useAdvancedFiltersManager({
    skillInput,
    universityInput,
    companyInput,
    technologyInput,
    projectNameInput,
    projectDescriptionInput,
    trainingInput,
    achievementInput,
    experienceYears,
    minGraduationYear,
    maxGraduationYear,
    completionStatus,
    onSkillFilter,
    onExperienceFilter,
    onProjectFilter,
    onTrainingFilter,
    onAchievementFilter,
    onAdvancedFilters,
    setSkillInput,
    setUniversityInput,
    setCompanyInput,
    setTechnologyInput,
    setProjectNameInput,
    setProjectDescriptionInput,
    setTrainingInput,
    setAchievementInput,
    setExperienceYears,
    setMinGraduationYear,
    setMaxGraduationYear,
    setCompletionStatus,
    onReset
  });

  const handleAISearch = (filters: any) => {
    console.log('Applying AI search filters:', filters);

    const changed: string[] = [];

    // Basic filters
    if ('search_query' in filters && filters.search_query !== searchQuery) {
      onSearch(filters.search_query);
      changed.push('search');
    }
    if ('skill_filter' in filters && filters.skill_filter !== skillFilter) {
      onSkillFilter(filters.skill_filter);
      changed.push('skill');
    }
    if ('experience_filter' in filters && filters.experience_filter !== experienceFilter) {
      onExperienceFilter(filters.experience_filter);
      changed.push('experience');
    }
    if ('education_filter' in filters && filters.education_filter !== educationFilter) {
      onEducationFilter(filters.education_filter);
      changed.push('education');
    }
    if ('training_filter' in filters && filters.training_filter !== trainingFilter) {
      onTrainingFilter(filters.training_filter);
      changed.push('training');
    }
    if ('achievement_filter' in filters && filters.achievement_filter !== achievementFilter) {
      onAchievementFilter(filters.achievement_filter);
      changed.push('achievement');
    }

    // Project filters - handle both legacy and specific filters
    if ('project_filter' in filters && filters.project_filter !== projectFilter) {
      onProjectFilter(filters.project_filter);
      changed.push('project');
    }
    if ('project_name_filter' in filters || 'project_description_filter' in filters) {
      // For AI search, combine project name and description filters into general project filter
      const projectQuery = [
        filters.project_name_filter,
        filters.project_description_filter
      ].filter(Boolean).join(' ');
      
      if (projectQuery && projectQuery !== projectFilter) {
        onProjectFilter(projectQuery);
        changed.push('project');
      }
    }

    // Technology filters - convert to project filter for now
    if ('technology_filter' in filters && Array.isArray(filters.technology_filter) && filters.technology_filter.length > 0) {
      const techQuery = filters.technology_filter.join(' ');
      if (techQuery !== projectFilter) {
        onProjectFilter(techQuery);
        changed.push('project');
      }
    }

    // Advanced filters
    const advancedFilters: any = {};
    let hasAdvancedFilters = false;

    if ('min_experience_years' in filters) {
      advancedFilters.minExperienceYears = filters.min_experience_years;
      setExperienceYears(prev => [filters.min_experience_years || prev[0], prev[1]]);
      hasAdvancedFilters = true;
      changed.push('experience-years');
    }
    if ('max_experience_years' in filters) {
      advancedFilters.maxExperienceYears = filters.max_experience_years;
      setExperienceYears(prev => [prev[0], filters.max_experience_years || prev[1]]);
      hasAdvancedFilters = true;
      changed.push('experience-years');
    }
    if ('min_graduation_year' in filters) {
      advancedFilters.minGraduationYear = filters.min_graduation_year;
      setMinGraduationYear(filters.min_graduation_year);
      hasAdvancedFilters = true;
      changed.push('graduation-years');
    }
    if ('max_graduation_year' in filters) {
      advancedFilters.maxGraduationYear = filters.max_graduation_year;
      setMaxGraduationYear(filters.max_graduation_year);
      hasAdvancedFilters = true;
      changed.push('graduation-years');
    }
    if ('completion_status' in filters && filters.completion_status !== completionStatus) {
      advancedFilters.completionStatus = filters.completion_status;
      setCompletionStatus(filters.completion_status);
      hasAdvancedFilters = true;
      changed.push('completion');
    }

    if (hasAdvancedFilters) {
      onAdvancedFilters(advancedFilters);
    }

    // Resource planning filters
    const resourceFilters: any = {};
    let hasResourceFilters = false;

    if ('min_engagement_percentage' in filters) {
      resourceFilters.minEngagementPercentage = filters.min_engagement_percentage;
      resourcePlanningState.setMinEngagementPercentage(String(filters.min_engagement_percentage));
      hasResourceFilters = true;
      changed.push('engagement');
    }
    if ('max_engagement_percentage' in filters) {
      resourceFilters.maxEngagementPercentage = filters.max_engagement_percentage;
      resourcePlanningState.setMaxEngagementPercentage(String(filters.max_engagement_percentage));
      hasResourceFilters = true;
      changed.push('engagement');
    }
    if ('min_billing_percentage' in filters) {
      resourceFilters.minBillingPercentage = filters.min_billing_percentage;
      resourcePlanningState.setMinBillingPercentage(String(filters.min_billing_percentage));
      hasResourceFilters = true;
      changed.push('billing');
    }
    if ('max_billing_percentage' in filters) {
      resourceFilters.maxBillingPercentage = filters.max_billing_percentage;
      resourcePlanningState.setMaxBillingPercentage(String(filters.max_billing_percentage));
      hasResourceFilters = true;
      changed.push('billing');
    }
    if ('release_date_from' in filters) {
      resourceFilters.releaseDateFrom = new Date(filters.release_date_from);
      resourcePlanningState.setReleaseDateFrom(new Date(filters.release_date_from));
      hasResourceFilters = true;
      changed.push('release-date');
    }
    if ('release_date_to' in filters) {
      resourceFilters.releaseDateTo = new Date(filters.release_date_to);
      resourcePlanningState.setReleaseDateTo(new Date(filters.release_date_to));
      hasResourceFilters = true;
      changed.push('release-date');
    }
    if ('availability_status' in filters) {
      resourceFilters.availabilityStatus = filters.availability_status;
      resourcePlanningState.setAvailabilityStatus(filters.availability_status);
      hasResourceFilters = true;
      changed.push('availability');
    }
    if ('current_project_search' in filters) {
      resourceFilters.currentProjectSearch = filters.current_project_search;
      resourcePlanningState.setCurrentProjectSearch(filters.current_project_search);
      hasResourceFilters = true;
      changed.push('current-project');
    }

    if (hasResourceFilters) {
      onResourcePlanningFilters(resourceFilters);
    }

    // Highlight applied filters
    setHighlightedFilters(Array.from(new Set(changed)));
    setTimeout(() => setHighlightedFilters([]), 3000); // Show highlights for 3 seconds
  };

  return (
    <div className="w-96 h-full flex flex-col">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 pb-3">
          <CompactSearchHeader
            searchQuery={searchQuery}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            onSearch={onSearch}
            onAISearch={handleAISearch}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <VerticalFilterChips
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
              onClearAllFilters={clearAllFilters}
              highlightedFilters={highlightedFilters}
            />
          )}

          {/* Resource Planning Filters */}
          <ResourcePlanningFilters {...resourcePlanningState} />

          <CollapsibleFilterSection
            title="Projects & Tech"
            icon="code"
            defaultOpen={true}
            type="projects"
            projectNameInput={projectNameInput}
            setProjectNameInput={setProjectNameInput}
            projectDescriptionInput={projectDescriptionInput}
            setProjectDescriptionInput={setProjectDescriptionInput}
            technologyInput={technologyInput}
            setTechnologyInput={setTechnologyInput}
            achievementInput={achievementInput}
            setAchievementInput={setAchievementInput}
            onProjectFilter={onProjectFilter}
            onAchievementFilter={onAchievementFilter}
            isLoading={isLoading}
          />

          <div className="space-y-3">
            <CollapsibleFilterSection
              title="Professional"
              icon="briefcase"
              defaultOpen={true}
              type="professional"
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              companyInput={companyInput}
              setCompanyInput={setCompanyInput}
              experienceYears={experienceYears}
              setExperienceYears={setExperienceYears}
              onSkillFilter={onSkillFilter}
              onExperienceFilter={onExperienceFilter}
              onAdvancedFilters={onAdvancedFilters}
              isLoading={isLoading}
            />

            <CollapsibleFilterSection
              title="Education & Training"
              icon="graduation-cap"
              defaultOpen={false}
              type="education"
              universityInput={universityInput}
              setUniversityInput={setUniversityInput}
              trainingInput={trainingInput}
              setTrainingInput={setTrainingInput}
              minGraduationYear={minGraduationYear}
              maxGraduationYear={maxGraduationYear}
              setMinGraduationYear={setMinGraduationYear}
              setMaxGraduationYear={setMaxGraduationYear}
              onEducationFilter={onEducationFilter}
              onTrainingFilter={onTrainingFilter}
              onAdvancedFilters={onAdvancedFilters}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalEmployeeSearchSidebar;
