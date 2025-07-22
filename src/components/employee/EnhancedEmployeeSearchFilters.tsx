
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import BasicSearchBar from './search/BasicSearchBar';
import SkillFilterDropdown from './search/SkillFilterDropdown';
import ExperienceFilterDropdown from './search/ExperienceFilterDropdown';
import EducationFilterDropdown from './search/EducationFilterDropdown';
import TrainingFilterDropdown from './search/TrainingFilterDropdown';
import AchievementFilterDropdown from './search/AchievementFilterDropdown';
import ProjectFilterDropdown from './search/ProjectFilterDropdown';
import ExperienceYearsFilter from './search/ExperienceYearsFilter';
import SortControls from './search/SortControls';
import FilterSummary from './search/FilterSummary';
import { EmployeeProfileSortColumn } from '@/hooks/use-employee-profiles-enhanced';

interface EnhancedEmployeeSearchFiltersProps {
  onSearch: (query: string) => void;
  onSkillFilter: (skill: string) => void;
  onExperienceFilter: (experience: string) => void;
  onEducationFilter: (education: string) => void;
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
  onProjectFilter: (project: string) => void;
  onExperienceYearsFilter: (min: number | null, max: number | null) => void;
  onAdvancedFilters: (filters: any) => void;
  onSortChange: (field: EmployeeProfileSortColumn, order: 'asc' | 'desc') => void;
  onReset: () => void;
  searchQuery: string | null;
  skillFilter: string | null;
  experienceFilter: string | null;
  educationFilter: string | null;
  trainingFilter: string | null;
  achievementFilter: string | null;
  projectFilter: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  sortBy: EmployeeProfileSortColumn;
  sortOrder: 'asc' | 'desc';
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
  onExperienceYearsFilter,
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
  minExperienceYears,
  maxExperienceYears,
  sortBy,
  sortOrder,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleExperienceYearsClear = () => {
    onExperienceYearsFilter(null, null);
  };

  const activeFilters = [
    { key: 'search', value: searchQuery, label: 'Search' },
    { key: 'skill', value: skillFilter, label: 'Skill' },
    { key: 'experience', value: experienceFilter, label: 'Experience' },
    { key: 'education', value: educationFilter, label: 'Education' },
    { key: 'training', value: trainingFilter, label: 'Training' },
    { key: 'achievement', value: achievementFilter, label: 'Achievement' },
    { key: 'project', value: projectFilter, label: 'Project' },
    { 
      key: 'experienceYears', 
      value: minExperienceYears !== null || maxExperienceYears !== null 
        ? `${minExperienceYears || 0}-${maxExperienceYears || '∞'} years` 
        : null, 
      label: 'Experience Years' 
    }
  ].filter(filter => filter.value);

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Search</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-6">
            <BasicSearchBar
              searchQuery={searchQuery || ''}
              onChange={onSearch}
              placeholder="Search by name, employee ID, designation, expertise..."
              isLoading={isLoading}
            />
            
            <div className="flex flex-wrap items-center gap-3">
              <SkillFilterDropdown
                value={skillFilter}
                onValueChange={onSkillFilter}
                onClear={() => onSkillFilter('')}
              />
              
              <ExperienceFilterDropdown
                value={experienceFilter}
                onValueChange={onExperienceFilter}
                onClear={() => onExperienceFilter('')}
              />
              
              <ExperienceYearsFilter
                minYears={minExperienceYears}
                maxYears={maxExperienceYears}
                onFilterChange={onExperienceYearsFilter}
                onClear={handleExperienceYearsClear}
              />
              
              <SortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkillFilterDropdown
                value={skillFilter}
                onValueChange={onSkillFilter}
                onClear={() => onSkillFilter('')}
              />
              
              <ExperienceFilterDropdown
                value={experienceFilter}
                onValueChange={onExperienceFilter}
                onClear={() => onExperienceFilter('')}
              />
              
              <EducationFilterDropdown
                value={educationFilter}
                onValueChange={onEducationFilter}
                onClear={() => onEducationFilter('')}
              />
              
              <TrainingFilterDropdown
                value={trainingFilter}
                onValueChange={onTrainingFilter}
                onClear={() => onTrainingFilter('')}
              />
              
              <AchievementFilterDropdown
                value={achievementFilter}
                onValueChange={onAchievementFilter}
                onClear={() => onAchievementFilter('')}
              />
              
              <ProjectFilterDropdown
                value={projectFilter}
                onValueChange={onProjectFilter}
                onClear={() => onProjectFilter('')}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <ExperienceYearsFilter
                minYears={minExperienceYears}
                maxYears={maxExperienceYears}
                onFilterChange={onExperienceYearsFilter}
                onClear={handleExperienceYearsClear}
              />
              
              <SortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <FilterSummary
          activeFilters={activeFilters}
          onReset={onReset}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedEmployeeSearchFilters;
