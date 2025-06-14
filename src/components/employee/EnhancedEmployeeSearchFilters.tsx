
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
  
  // Advanced filter states
  const [experienceYears, setExperienceYears] = useState<number[]>([0, 20]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minGraduationYear, setMinGraduationYear] = useState<number | null>(null);
  const [maxGraduationYear, setMaxGraduationYear] = useState<number | null>(null);
  const [completionStatus, setCompletionStatus] = useState<string>('all');
  
  const [skillInput, setSkillInput] = useState('');
  const [universityInput, setUniversityInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState<string[]>([]);

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
    technologyInput
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
    technologyInput
  });

  const { handleApplyAdvancedFilters, clearAllFilters } = useAdvancedFiltersManager({
    skillInput,
    universityInput,
    companyInput,
    technologyInput,
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
              experienceYears={experienceYears}
              setExperienceYears={setExperienceYears}
              completionStatus={completionStatus}
              setCompletionStatus={setCompletionStatus}
              minGraduationYear={minGraduationYear}
              maxGraduationYear={maxGraduationYear}
              setMinGraduationYear={setMinGraduationYear}
              setMaxGraduationYear={setMaxGraduationYear}
              onApplyFilters={handleApplyAdvancedFilters}
              onClearAllFilters={clearAllFilters}
              onEducationFilter={onEducationFilter}
              isLoading={isLoading}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default EnhancedEmployeeSearchFilters;
