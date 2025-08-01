
import React, { useState } from 'react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import CompactSearchHeader from './CompactSearchHeader';
import VerticalFilterChips from './VerticalFilterChips';
import CollapsibleFilterSection from './CollapsibleFilterSection';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';

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
  // Local state for form inputs
  const [skillInput, setSkillInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const [educationInput, setEducationInput] = useState('');
  const [trainingInput, setTrainingInput] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');
  const [projectDescriptionInput, setProjectDescriptionInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
  }>({});

  const handleAdvancedFilterChange = (field: string, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyAdvancedFilters = () => {
    onAdvancedFilters(advancedFilters);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({});
    onAdvancedFilters({});
  };

  // Create active filters array
  const activeFilters = [];
  if (searchQuery) activeFilters.push({ id: 'search', label: `Search: ${searchQuery}`, type: 'search' });
  if (skillFilter) activeFilters.push({ id: 'skill', label: `Skill: ${skillFilter}`, type: 'skill' });
  if (experienceFilter) activeFilters.push({ id: 'experience', label: `Experience: ${experienceFilter}`, type: 'experience' });
  if (educationFilter) activeFilters.push({ id: 'education', label: `Education: ${educationFilter}`, type: 'education' });
  if (trainingFilter) activeFilters.push({ id: 'training', label: `Training: ${trainingFilter}`, type: 'training' });
  if (achievementFilter) activeFilters.push({ id: 'achievement', label: `Achievement: ${achievementFilter}`, type: 'achievement' });
  if (projectFilter) activeFilters.push({ id: 'project', label: `Project: ${projectFilter}`, type: 'project' });

  const removeFilter = (filterId: string) => {
    switch (filterId) {
      case 'search':
        onSearch('');
        break;
      case 'skill':
        onSkillFilter('');
        break;
      case 'experience':
        onExperienceFilter('');
        break;
      case 'education':
        onEducationFilter('');
        break;
      case 'training':
        onTrainingFilter('');
        break;
      case 'achievement':
        onAchievementFilter('');
        break;
      case 'project':
        onProjectFilter('');
        break;
    }
  };

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
              highlightedFilters={[]}
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
