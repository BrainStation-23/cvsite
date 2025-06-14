
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Sparkles, ArrowUpDown } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import BasicSearchBar from './BasicSearchBar';
import AISearchBar from './AISearchBar';
import FilterChipsList from './FilterChipsList';
import AdvancedFiltersPanel from './AdvancedFiltersPanel';
import SortControls from './SortControls';
import { useFilterState } from './FilterState';
import { useFilterChipsManager } from './FilterChipsManager';
import { useAdvancedFiltersManager } from './AdvancedFiltersManager';

interface CompactSearchFiltersProps {
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

const CompactSearchFilters: React.FC<CompactSearchFiltersProps> = ({
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
  
  // Advanced filter states
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
    projectDescriptionInput
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
    technologyInput
  });

  const { 
    applySkillFilter,
    applyCompanyFilter,
    applyProjectNameFilter,
    applyProjectDescriptionFilter,
    applyTechnologyFilter,
    applyAdvancedFilters,
    clearAllFilters 
  } = useAdvancedFiltersManager({
    skillInput,
    universityInput,
    companyInput,
    technologyInput,
    projectNameInput,
    projectDescriptionInput,
    experienceYears,
    minGraduationYear,
    maxGraduationYear,
    completionStatus,
    onSkillFilter,
    onExperienceFilter,
    onProjectFilter,
    onAdvancedFilters,
    setSkillInput,
    setUniversityInput,
    setCompanyInput,
    setTechnologyInput,
    setProjectNameInput,
    setProjectDescriptionInput,
    setExperienceYears,
    setMinGraduationYear,
    setMaxGraduationYear,
    setCompletionStatus,
    onReset
  });

  const handleAISearch = (filters: any) => {
    console.log('Applying AI search filters:', filters);
    
    // Clear any existing filters first
    onReset();
    
    // Apply each filter if present
    if (filters.search_query) {
      onSearch(filters.search_query);
    }
    if (filters.skill_filter) {
      onSkillFilter(filters.skill_filter);
    }
    if (filters.experience_filter) {
      onExperienceFilter(filters.experience_filter);
    }
    if (filters.education_filter) {
      onEducationFilter(filters.education_filter);
    }
    if (filters.training_filter) {
      onTrainingFilter(filters.training_filter);
    }
    if (filters.achievement_filter) {
      onAchievementFilter(filters.achievement_filter);
    }
    if (filters.project_filter) {
      onProjectFilter(filters.project_filter);
    }
    
    // Apply advanced filters
    const advancedFilters: any = {};
    if (filters.min_experience_years !== undefined) {
      advancedFilters.minExperienceYears = filters.min_experience_years;
    }
    if (filters.max_experience_years !== undefined) {
      advancedFilters.maxExperienceYears = filters.max_experience_years;
    }
    if (filters.min_graduation_year !== undefined) {
      advancedFilters.minGraduationYear = filters.min_graduation_year;
    }
    if (filters.max_graduation_year !== undefined) {
      advancedFilters.maxGraduationYear = filters.max_graduation_year;
    }
    if (filters.completion_status) {
      advancedFilters.completionStatus = filters.completion_status;
    }
    
    if (Object.keys(advancedFilters).length > 0) {
      onAdvancedFilters(advancedFilters);
    }
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Mode Tabs */}
        <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'manual' | 'ai')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-1 text-xs">
              <Filter className="h-3 w-3" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              AI Search
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <BasicSearchBar
              searchQuery={searchQuery}
              onSearch={onSearch}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="ai" className="mt-4">
            <AISearchBar
              onAISearch={handleAISearch}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Sort Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ArrowUpDown className="h-4 w-4" />
            Sort Options
          </div>
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Active Filters</div>
            <FilterChipsList
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
              onClearAllFilters={clearAllFilters}
            />
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-sm">
              Advanced Filters
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
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
              onAdvancedFilters={applyAdvancedFilters}
              onEducationFilter={onEducationFilter}
              onClearAllFilters={clearAllFilters}
              isLoading={isLoading}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default CompactSearchFilters;
