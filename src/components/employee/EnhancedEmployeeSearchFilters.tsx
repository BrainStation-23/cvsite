import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Sparkles } from 'lucide-react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BasicSearchBar from './search/BasicSearchBar';
import AISearchBar from './search/AISearchBar';
import FilterChipsList from './search/FilterChipsList';
import AdvancedFiltersPanel from './search/AdvancedFiltersPanel';
import SortControls from './search/SortControls';
import { useFilterState } from './search/FilterState';
import { useFilterChipsManager } from './search/FilterChipsManager';
import { useAdvancedFiltersManager } from './search/AdvancedFiltersManager';

interface EnhancedEmployeeSearchFiltersProps {
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

const EnhancedEmployeeSearchFilters: React.FC<EnhancedEmployeeSearchFiltersProps> = ({
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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
    let updates: Record<string, any> = {};

    if ('search_query' in filters && filters.search_query !== searchQuery) {
      onSearch(filters.search_query);
      changed.push('search');
      updates.searchQuery = filters.search_query;
    }
    if ('skill_filter' in filters && filters.skill_filter !== skillFilter) {
      onSkillFilter(filters.skill_filter);
      changed.push('skill');
      updates.skillFilter = filters.skill_filter;
    }
    if ('experience_filter' in filters && filters.experience_filter !== experienceFilter) {
      onExperienceFilter(filters.experience_filter);
      changed.push('experience');
      updates.experienceFilter = filters.experience_filter;
    }
    if ('education_filter' in filters && filters.education_filter !== educationFilter) {
      onEducationFilter(filters.education_filter);
      changed.push('education');
      updates.educationFilter = filters.education_filter;
    }
    if ('training_filter' in filters && filters.training_filter !== trainingFilter) {
      onTrainingFilter(filters.training_filter);
      changed.push('training');
      updates.trainingFilter = filters.training_filter;
    }
    if ('achievement_filter' in filters && filters.achievement_filter !== achievementFilter) {
      onAchievementFilter(filters.achievement_filter);
      changed.push('achievement');
      updates.achievementFilter = filters.achievement_filter;
    }
    if ('project_filter' in filters && filters.project_filter !== projectFilter) {
      onProjectFilter(filters.project_filter);
      changed.push('project');
      updates.projectFilter = filters.project_filter;
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

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border space-y-6">
      {/* Header with Search Controls and Sort */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 w-full lg:w-auto">
          {/* Search Mode Tabs */}
          <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'manual' | 'ai')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Manual Search
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Search
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <BasicSearchBar
                searchQuery={searchQuery}
                onSearch={onSearch}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="ai">
              <AISearchBar
                onAISearch={handleAISearch}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex-shrink-0">
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <FilterChipsList
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearAllFilters={clearAllFilters}
          highlightedFilters={highlightedFilters}
        />
      )}

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-start">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AdvancedFiltersPanel
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
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default EnhancedEmployeeSearchFilters;
