import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { 
  EmployeeProfileSortColumn
} from '@/hooks/use-employee-profiles-enhanced';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface EnhancedEmployeeSearchFiltersProps {
  onSearch: (query: string) => void;
  onSkillFilter: (skill: string) => void;
  onExperienceFilter: (experience: string) => void;
  onEducationFilter: (education: string) => void;
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
  onProjectFilter: (project: string) => void;
  onSortChange: (column: EmployeeProfileSortColumn, order: 'asc' | 'desc') => void;
  onAdvancedFilters: (filters: { minExperienceYears?: number | null; maxExperienceYears?: number | null }) => void;
  onReset: () => void;
  searchQuery: string | null;
  skillFilter: string | null;
  experienceFilter: string | null;
  educationFilter: string | null;
  trainingFilter: string | null;
  achievementFilter: string | null;
  projectFilter: string | null;
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
  onSortChange,
  onAdvancedFilters,
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
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [skillInput, setSkillInput] = useState(skillFilter || '');
  const [experienceInput, setExperienceInput] = useState(experienceFilter || '');
  const [educationInput, setEducationInput] = useState(educationFilter || '');
  const [trainingInput, setTrainingInput] = useState(trainingFilter || '');
  const [achievementInput, setAchievementInput] = useState(achievementFilter || '');
  const [projectInput, setProjectInput] = useState(projectFilter || '');
  const [minExperienceYears, setMinExperienceYears] = useState<string>('');
  const [maxExperienceYears, setMaxExperienceYears] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleApplyFilters = () => {
    onSkillFilter(skillInput);
    onExperienceFilter(experienceInput);
    onEducationFilter(educationInput);
    onTrainingFilter(trainingInput);
    onAchievementFilter(achievementInput);
    onProjectFilter(projectInput);
    
    // Apply experience years filter
    onAdvancedFilters({
      minExperienceYears: minExperienceYears ? parseInt(minExperienceYears) : null,
      maxExperienceYears: maxExperienceYears ? parseInt(maxExperienceYears) : null,
    });
  };

  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [EmployeeProfileSortColumn, 'asc' | 'desc'];
    onSortChange(column, order);
  };

  const clearInput = (inputType: string) => {
    switch (inputType) {
      case 'search':
        setSearchInput('');
        onSearch('');
        break;
      case 'skill':
        setSkillInput('');
        onSkillFilter('');
        break;
      case 'experience':
        setExperienceInput('');
        onExperienceFilter('');
        break;
      case 'education':
        setEducationInput('');
        onEducationFilter('');
        break;
      case 'training':
        setTrainingInput('');
        onTrainingFilter('');
        break;
      case 'achievement':
        setAchievementInput('');
        onAchievementFilter('');
        break;
      case 'project':
        setProjectInput('');
        onProjectFilter('');
        break;
      case 'minExperience':
        setMinExperienceYears('');
        break;
      case 'maxExperience':
        setMaxExperienceYears('');
        break;
    }
  };

  const hasActiveFilters = skillFilter || experienceFilter || educationFilter || 
                          trainingFilter || achievementFilter || projectFilter ||
                          minExperienceYears || maxExperienceYears;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search employees by name, ID, designation, expertise..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => clearInput('search')}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
      </form>

      <div className="flex items-center justify-between">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {hasActiveFilters && (
                <span className="bg-cvsite-teal text-white text-xs px-2 py-1 rounded-full ml-2">
                  Active
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Skills
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by skills..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                  {skillInput && (
                    <button
                      type="button"
                      onClick={() => clearInput('skill')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Company/Experience
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by company or role..."
                    value={experienceInput}
                    onChange={(e) => setExperienceInput(e.target.value)}
                  />
                  {experienceInput && (
                    <button
                      type="button"
                      onClick={() => clearInput('experience')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Education
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by education..."
                    value={educationInput}
                    onChange={(e) => setEducationInput(e.target.value)}
                  />
                  {educationInput && (
                    <button
                      type="button"
                      onClick={() => clearInput('education')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Min Experience (Years)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min years of experience"
                    value={minExperienceYears}
                    onChange={(e) => setMinExperienceYears(e.target.value)}
                  />
                  {minExperienceYears && (
                    <button
                      type="button"
                      onClick={() => clearInput('minExperience')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Max Experience (Years)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max years of experience"
                    value={maxExperienceYears}
                    onChange={(e) => setMaxExperienceYears(e.target.value)}
                  />
                  {maxExperienceYears && (
                    <button
                      type="button"
                      onClick={() => clearInput('maxExperience')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Training
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by training..."
                    value={trainingInput}
                    onChange={(e) => setTrainingInput(e.target.value)}
                  />
                  {trainingInput && (
                    <button
                      type="button"
                      onClick={() => clearInput('training')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters} disabled={isLoading}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={onReset} disabled={isLoading}>
                Reset All
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div>
          <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_name-asc">Last Name (A-Z)</SelectItem>
              <SelectItem value="last_name-desc">Last Name (Z-A)</SelectItem>
              <SelectItem value="first_name-asc">First Name (A-Z)</SelectItem>
              <SelectItem value="first_name-desc">First Name (Z-A)</SelectItem>
              <SelectItem value="employee_id-asc">Employee ID (A-Z)</SelectItem>
              <SelectItem value="employee_id-desc">Employee ID (Z-A)</SelectItem>
              <SelectItem value="total_experience-desc">Most Experience</SelectItem>
              <SelectItem value="total_experience-asc">Least Experience</SelectItem>
              <SelectItem value="company_experience-desc">Longest with Company</SelectItem>
              <SelectItem value="company_experience-asc">Newest with Company</SelectItem>
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
