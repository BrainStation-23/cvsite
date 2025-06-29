
import React, { useState } from 'react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import FilterSidebar from './search/FilterSidebar';
import StickySearchHeader from './search/StickySearchHeader';
import QuickFiltersBar from './search/QuickFiltersBar';
import { useFilterState } from './search/FilterState';
import { useFilterChipsManager } from './search/FilterChipsManager';
import { useAdvancedFiltersManager } from './search/AdvancedFiltersManager';

interface RedesignedEmployeeSearchFiltersProps {
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
  totalResults?: number;
  filteredResults?: number;
}

const RedesignedEmployeeSearchFilters: React.FC<RedesignedEmployeeSearchFiltersProps> = ({
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
  isLoading,
  totalResults,
  filteredResults
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  // Use custom hooks for state management
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

  const { 
    applySkillFilter,
    applyCompanyFilter,
    applyProjectNameFilter,
    applyProjectDescriptionFilter,
    applyTechnologyFilter,
    applyTrainingFilter,
    applyAchievementFilter,
    applyAdvancedFilters,
    clearAllFilters 
  } = useAdvancedFiltersManager({
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

    // Advanced filters
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
    <div className="relative">
      {/* Sticky Search Header */}
      <StickySearchHeader
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        searchQuery={searchQuery}
        onSearch={onSearch}
        onAISearch={handleAISearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        isLoading={isLoading}
        filtersOpen={filtersOpen}
      />

      {/* Quick Filters Bar */}
      <QuickFiltersBar
        activeFilters={activeFilters}
        onRemoveFilter={removeFilter}
        onClearAllFilters={clearAllFilters}
        totalResults={totalResults}
        filteredResults={filteredResults}
      />

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        skillInput={skillInput}
        setSkillInput={setSkillInput}
        universityInput={universityInput}
        setUniversityInput={setUniversityInput}
        companyInput={companyInput}
        setCompanyInput={setCompanyInput}
        technologyInput={technologyInput}
        setTechnologyInput={setTechnologyInput}
        projectNameInput={projectNameInput}
        setProjectNameInput={setProjectNameInput}
        projectDescriptionInput={projectDescriptionInput}
        setProjectDescriptionInput={setProjectDescriptionInput}
        trainingInput={trainingInput}
        setTrainingInput={setTrainingInput}
        achievementInput={achievementInput}
        setAchievementInput={setAchievementInput}
        experienceYears={experienceYears}
        setExperienceYears={setExperienceYears}
        completionStatus={completionStatus}
        setCompletionStatus={setCompletionStatus}
        minGraduationYear={minGraduationYear}
        maxGraduationYear={maxGraduationYear}
        setMinGraduationYear={setMinGraduationYear}
        setMaxGraduationYear={setMaxGraduationYear}
        onSkillFilter={applySkillFilter}
        onCompanyFilter={applyCompanyFilter}
        onProjectNameFilter={applyProjectNameFilter}
        onProjectDescriptionFilter={applyProjectDescriptionFilter}
        onTechnologyFilter={applyTechnologyFilter}
        onTrainingFilter={applyTrainingFilter}
        onAchievementFilter={applyAchievementFilter}
        onAdvancedFilters={applyAdvancedFilters}
        onEducationFilter={onEducationFilter}
        onClearAllFilters={clearAllFilters}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RedesignedEmployeeSearchFilters;
