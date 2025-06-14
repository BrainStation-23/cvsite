
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DateRange } from 'react-day-picker';

// Import our new components
import BasicSearchBar from './search/BasicSearchBar';
import FilterChipsList from './search/FilterChipsList';
import AdvancedFiltersPanel from './search/AdvancedFiltersPanel';
import SortControls from './search/SortControls';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: string;
}

interface EnhancedEmployeeSearchFiltersProps {
  onSearch: (query: string) => void;
  onSkillFilter: (skill: string) => void;
  onExperienceFilter: (experience: string) => void;
  onEducationFilter: (education: string) => void;
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
  onProjectFilter: (project: string) => void;
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
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);
  
  // Advanced filter states
  const [experienceYears, setExperienceYears] = useState<number[]>([0, 20]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [graduationDateRange, setGraduationDateRange] = useState<DateRange | undefined>();
  const [completionStatus, setCompletionStatus] = useState<string>('all');
  
  const [skillInput, setSkillInput] = useState('');
  const [universityInput, setUniversityInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');

  // Update active filters when inputs change
  useEffect(() => {
    const filters: FilterChip[] = [];
    
    if (searchQuery) {
      filters.push({ id: 'search', label: `Search: "${searchQuery}"`, value: searchQuery, type: 'search' });
    }
    
    if (skillFilter) {
      filters.push({ id: 'skill', label: `Skills: ${skillFilter}`, value: skillFilter, type: 'skill' });
    }
    
    if (experienceFilter) {
      filters.push({ id: 'experience', label: `Experience: ${experienceFilter}`, value: experienceFilter, type: 'experience' });
    }
    
    if (educationFilter) {
      filters.push({ id: 'education', label: `Education: ${educationFilter}`, value: educationFilter, type: 'education' });
    }
    
    if (trainingFilter) {
      filters.push({ id: 'training', label: `Training: ${trainingFilter}`, value: trainingFilter, type: 'training' });
    }
    
    if (achievementFilter) {
      filters.push({ id: 'achievement', label: `Achievements: ${achievementFilter}`, value: achievementFilter, type: 'achievement' });
    }
    
    if (projectFilter) {
      filters.push({ id: 'project', label: `Projects: ${projectFilter}`, value: projectFilter, type: 'project' });
    }

    if (experienceYears[0] > 0 || experienceYears[1] < 20) {
      filters.push({ 
        id: 'experience-years', 
        label: `Experience: ${experienceYears[0]}-${experienceYears[1]} years`, 
        value: experienceYears.join('-'), 
        type: 'experience-years' 
      });
    }

    if (completionStatus !== 'all') {
      filters.push({ 
        id: 'completion', 
        label: `Status: ${completionStatus}`, 
        value: completionStatus, 
        type: 'completion' 
      });
    }

    if (skillInput) {
      filters.push({ 
        id: 'skill-input', 
        label: `Skills: ${skillInput}`, 
        value: skillInput, 
        type: 'skill-input' 
      });
    }

    if (universityInput) {
      filters.push({ 
        id: 'university-input', 
        label: `University: ${universityInput}`, 
        value: universityInput, 
        type: 'university-input' 
      });
    }

    if (companyInput) {
      filters.push({ 
        id: 'company-input', 
        label: `Company: ${companyInput}`, 
        value: companyInput, 
        type: 'company-input' 
      });
    }

    if (technologyInput) {
      filters.push({ 
        id: 'technology-input', 
        label: `Technology: ${technologyInput}`, 
        value: technologyInput, 
        type: 'technology-input' 
      });
    }
    
    setActiveFilters(filters);
  }, [searchQuery, skillFilter, experienceFilter, educationFilter, trainingFilter, achievementFilter, projectFilter, experienceYears, completionStatus, skillInput, universityInput, companyInput, technologyInput]);

  const removeFilter = (filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (!filter) return;

    switch (filter.type) {
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
      case 'experience-years':
        setExperienceYears([0, 20]);
        break;
      case 'completion':
        setCompletionStatus('all');
        break;
      case 'skill-input':
        setSkillInput('');
        break;
      case 'university-input':
        setUniversityInput('');
        break;
      case 'company-input':
        setCompanyInput('');
        break;
      case 'technology-input':
        setTechnologyInput('');
        break;
    }
  };

  const handleApplyAdvancedFilters = () => {
    console.log('Applying advanced filters:', {
      skillInput,
      universityInput, 
      companyInput,
      technologyInput,
      experienceYears,
      completionStatus
    });

    // Apply skill selections
    if (skillInput) {
      onSkillFilter(skillInput);
    }

    // Apply other advanced filters
    if (universityInput) {
      onEducationFilter(universityInput);
    }

    if (companyInput) {
      onExperienceFilter(companyInput);
    }

    if (technologyInput) {
      onProjectFilter(technologyInput);
    }

    // Note: Experience years and completion status would need backend support
    // For now, they are tracked in the active filters for UI feedback
  };

  const clearAllFilters = () => {
    setSkillInput('');
    setUniversityInput('');
    setCompanyInput('');
    setTechnologyInput('');
    setExperienceYears([0, 20]);
    setCompletionStatus('all');
    setGraduationDateRange(undefined);
    onReset();
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border space-y-6">
      {/* Main Search Bar */}
      <BasicSearchBar
        searchQuery={searchQuery}
        onSearch={onSearch}
        isLoading={isLoading}
      />

      {/* Active Filters */}
      {hasActiveFilters && (
        <FilterChipsList
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearAllFilters={clearAllFilters}
        />
      )}

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
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
              graduationDateRange={graduationDateRange}
              setGraduationDateRange={setGraduationDateRange}
              onApplyFilters={handleApplyAdvancedFilters}
              onClearAllFilters={clearAllFilters}
              isLoading={isLoading}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Sort Controls */}
        <SortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
};

export default EnhancedEmployeeSearchFilters;
