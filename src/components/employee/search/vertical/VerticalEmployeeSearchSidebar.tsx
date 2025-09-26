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



  return (
    <div className="w-96 h-full flex flex-col">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 pb-3">
          <CompactSearchHeader
            searchQuery={searchQuery}
            onSearch={onSearch}
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
