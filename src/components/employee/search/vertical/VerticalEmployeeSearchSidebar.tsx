
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import CompactSearchHeader from './CompactSearchHeader';
import VerticalSortControls from './VerticalSortControls';
import VerticalFilterChips from './VerticalFilterChips';
import CollapsibleFilterSection from './CollapsibleFilterSection';
import FilterPresets from './FilterPresets';
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
  const [searchMode, setSearchMode] = useState<'manual' | 'ai'>('manual');
  const [experienceYears, setExperienceYears] = useState<number[]>([0, 20]);
  const [minGraduationYear, setMinGraduationYear] = useState<number | null>(null);
  const [maxGraduationYear, setMaxGraduationYear] = useState<number | null>(null);
  const [completionStatus, setCompletionStatus] = useState<string>('all');
  
  const [skillInput, setSkillInput] = useState('');
  const [universityInput, setUniversityInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState<string[]>([]);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [projectDescriptionInput, setProjectDescriptionInput] = useState('');
  const [trainingInput, setTrainingInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const [highlightedFilters, setHighlightedFilters] = useState<string[]>([]);

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
    if ('project_filter' in filters && filters.project_filter !== projectFilter) {
      onProjectFilter(filters.project_filter);
      changed.push('project');
    }

    const advancedFilters: any = {};
    if ('min_experience_years' in filters) {
      advancedFilters.minExperienceYears = filters.min_experience_years;
      changed.push('experience-years');
    }
    if ('max_experience_years' in filters) {
      advancedFilters.maxExperienceYears = filters.max_experience_years;
      changed.push('experience-years');
    }
    if ('min_graduation_year' in filters) {
      advancedFilters.minGraduationYear = filters.min_graduation_year;
      changed.push('graduation-years');
    }
    if ('max_graduation_year' in filters) {
      advancedFilters.maxGraduationYear = filters.max_graduation_year;
      changed.push('graduation-years');
    }
    if ('completion_status' in filters && filters.completion_status !== completionStatus) {
      advancedFilters.completionStatus = filters.completion_status;
      changed.push('completion');
    }

    if (Object.keys(advancedFilters).length > 0) {
      onAdvancedFilters(advancedFilters);
    }

    setHighlightedFilters(Array.from(new Set(changed)));
    setTimeout(() => setHighlightedFilters([]), 2000);
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
          {/* Sort Controls */}
          <VerticalSortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />

          {/* Filter Presets */}
          <FilterPresets
            onLoadPreset={() => {}}
            onSavePreset={() => {}}
          />

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <VerticalFilterChips
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
              onClearAllFilters={clearAllFilters}
              highlightedFilters={highlightedFilters}
            />
          )}

          {/* Collapsible Filter Sections */}
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

            <CollapsibleFilterSection
              title="Projects & Tech"
              icon="code"
              defaultOpen={false}
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

            <CollapsibleFilterSection
              title="Profile Status"
              icon="user-check"
              defaultOpen={false}
              type="status"
              completionStatus={completionStatus}
              setCompletionStatus={setCompletionStatus}
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
