import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, X, Filter, Calendar, Trash } from 'lucide-react';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

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
  const [searchInput, setSearchInput] = useState(searchQuery);
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
    
    if (searchInput) {
      filters.push({ id: 'search', label: `Search: "${searchInput}"`, value: searchInput, type: 'search' });
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
    
    setActiveFilters(filters);
  }, [searchInput, skillFilter, experienceFilter, educationFilter, trainingFilter, achievementFilter, projectFilter, experienceYears, completionStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [EmployeeProfileSortColumn, EmployeeProfileSortOrder];
    onSortChange(column, order);
  };

  const removeFilter = (filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (!filter) return;

    switch (filter.type) {
      case 'search':
        setSearchInput('');
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
    }
  };

  const handleApplyAdvancedFilters = () => {
    // Apply experience years filter
    if (experienceYears[0] > 0 || experienceYears[1] < 20) {
      // This would need to be implemented in the backend to handle experience years
      console.log('Experience years filter:', experienceYears);
    }

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
  };

  const clearAllFilters = () => {
    setSearchInput('');
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
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search employees by name, ID, skills, company, or any content..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-11"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onSearch('');
              }}
              className="absolute right-3 top-1/2 transform -y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="h-11 px-6">
          Search
        </Button>
      </form>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-3 text-xs"
          >
            <Trash className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
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
          <CollapsibleContent className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Skills Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </label>
                <Input
                  placeholder="e.g., React, Python, AWS"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
              </div>

              {/* University Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  University
                </label>
                <Input
                  placeholder="e.g., MIT, Stanford"
                  value={universityInput}
                  onChange={(e) => setUniversityInput(e.target.value)}
                />
              </div>

              {/* Company Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company
                </label>
                <Input
                  placeholder="e.g., Google, Microsoft"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                />
              </div>

              {/* Technology Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Technologies
                </label>
                <Input
                  placeholder="e.g., Docker, Kubernetes"
                  value={technologyInput}
                  onChange={(e) => setTechnologyInput(e.target.value)}
                />
              </div>

              {/* Experience Years Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Experience (Years)
                </label>
                <div className="px-3">
                  <Slider
                    value={experienceYears}
                    onValueChange={setExperienceYears}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{experienceYears[0]} years</span>
                    <span>{experienceYears[1]}+ years</span>
                  </div>
                </div>
              </div>

              {/* Profile Completion Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Status
                </label>
                <Select value={completionStatus} onValueChange={setCompletionStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Profiles</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="no-skills">Missing Skills</SelectItem>
                    <SelectItem value="no-experience">Missing Experience</SelectItem>
                    <SelectItem value="no-education">Missing Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Graduation Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Graduation Period
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !graduationDateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {graduationDateRange?.from ? (
                        graduationDateRange.to ? (
                          <>
                            {format(graduationDateRange.from, "MMM yyyy")} -{" "}
                            {format(graduationDateRange.to, "MMM yyyy")}
                          </>
                        ) : (
                          format(graduationDateRange.from, "MMM yyyy")
                        )
                      ) : (
                        "Pick date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={graduationDateRange?.from}
                      selected={graduationDateRange}
                      onSelect={setGraduationDateRange}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={handleApplyAdvancedFilters} disabled={isLoading}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_name-asc">Last Name (A-Z)</SelectItem>
              <SelectItem value="last_name-desc">Last Name (Z-A)</SelectItem>
              <SelectItem value="first_name-asc">First Name (A-Z)</SelectItem>
              <SelectItem value="first_name-desc">First Name (Z-A)</SelectItem>
              <SelectItem value="employee_id-asc">Employee ID (A-Z)</SelectItem>
              <SelectItem value="employee_id-desc">Employee ID (Z-A)</SelectItem>
              <SelectItem value="created_at-desc">Recently Added</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmployeeSearchFilters;
