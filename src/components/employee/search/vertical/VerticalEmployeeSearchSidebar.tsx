import React, { useState } from 'react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import CompactSearchHeader from './CompactSearchHeader';
import VerticalFilterChips from './VerticalFilterChips';
import CollapsibleFilterSection from './CollapsibleFilterSection';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { useFilterState } from '../FilterState';
import { useFilterChipsManager } from '../FilterChipsManager';
import { useAdvancedFiltersManager } from '../AdvancedFiltersManager';

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
    releaseDateFrom?: string | null;
    releaseDateTo?: string | null;
    availabilityStatus?: string | null;
    currentProjectSearch?: string | null;
  }) => void;
  onSortChange: (column: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => void;
  onReset: () => void;
  searchQuery: string | null;
  skillFilter: string | null;
  experienceFilter: string | null;
  educationFilter: string | null;
  trainingFilter: string | null;
  achievementFilter: string | null;
  projectFilter: string | null;
  sortBy: EmployeeProfileSortColumn;
  sortOrder: EmployeeProfileSortOrder;
  isLoading?: boolean;
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
  isLoading = false
}) => {
  const {
    skillInput,
    setSkillInput,
    experienceInput,
    setExperienceInput,
    educationInput,
    setEducationInput,
    trainingInput,
    setTrainingInput,
    projectNameInput,
    setProjectNameInput,
    projectDescriptionInput,
    setProjectDescriptionInput,
    technologyInput,
    setTechnologyInput,
    achievementInput,
    setAchievementInput
  } = useFilterState();

  const {
    activeFilters,
    highlightedFilters,
    removeFilter
  } = useFilterChipsManager({
    searchQuery,
    skillFilter,
    experienceFilter,
    educationFilter,
    trainingFilter,
    achievementFilter,
    projectFilter,
    onSearch,
    onSkillFilter,
    onExperienceFilter,
    onEducationFilter,
    onTrainingFilter,
    onAchievementFilter,
    onProjectFilter
  });

  const {
    showAdvancedFilters,
    setShowAdvancedFilters,
    advancedFilters,
    handleAdvancedFilterChange,
    applyAdvancedFilters,
    clearAdvancedFilters
  } = useAdvancedFiltersManager(onAdvancedFilters);

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Fixed Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <CompactSearchHeader
          searchQuery={searchQuery || ''}
          onSearchChange={onSearch}
          onReset={onReset}
          isLoading={isLoading}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <VerticalFilterChips
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
              isLoading={isLoading}
              highlightedFilters={highlightedFilters}
            />
          )}

          {/* Resource Planning Filters - New */}
          <ResourcePlanningFilters
            onResourcePlanningFilters={onResourcePlanningFilters}
            isLoading={isLoading}
          />

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

          {/* Collapsible Filter Sections */}
          <div className="space-y-3">
            <CollapsibleFilterSection
              title="Skills & Expertise"
              icon="target"
              defaultOpen={false}
              type="skills"
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              onSkillFilter={onSkillFilter}
              isLoading={isLoading}
            />

            <CollapsibleFilterSection
              title="Experience & Career"
              icon="briefcase"
              defaultOpen={false}
              type="experience"
              experienceInput={experienceInput}
              setExperienceInput={setExperienceInput}
              onExperienceFilter={onExperienceFilter}
              isLoading={isLoading}
            />

            <CollapsibleFilterSection
              title="Education & Training"
              icon="graduation-cap"
              defaultOpen={false}
              type="education"
              educationInput={educationInput}
              setEducationInput={setEducationInput}
              trainingInput={trainingInput}
              setTrainingInput={setTrainingInput}
              onEducationFilter={onEducationFilter}
              onTrainingFilter={onTrainingFilter}
              isLoading={isLoading}
            />

            <CollapsibleFilterSection
              title="Profile Status"
              icon="user-check"
              defaultOpen={false}
              type="advanced"
              showAdvancedFilters={showAdvancedFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              advancedFilters={advancedFilters}
              onAdvancedFilterChange={handleAdvancedFilterChange}
              onApplyAdvancedFilters={applyAdvancedFilters}
              onClearAdvancedFilters={clearAdvancedFilters}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalEmployeeSearchSidebar;
