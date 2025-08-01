
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
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface EmployeeSearchFiltersProps {
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

const EmployeeSearchFilters: React.FC<EmployeeSearchFiltersProps> = ({
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
  const [skillInput, setSkillInput] = useState(skillFilter);
  const [experienceInput, setExperienceInput] = useState(experienceFilter);
  const [educationInput, setEducationInput] = useState(educationFilter);
  const [trainingInput, setTrainingInput] = useState(trainingFilter);
  const [achievementInput, setAchievementInput] = useState(achievementFilter);
  const [projectInput, setProjectInput] = useState(projectFilter);
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
  };

  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [EmployeeProfileSortColumn, EmployeeProfileSortOrder];
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
    }
  };

  const hasActiveFilters = skillFilter || experienceFilter || educationFilter || 
                          trainingFilter || achievementFilter || projectFilter;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search employees by name, ID, or any content..."
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
                  Experience
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by experience..."
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
              
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Achievements
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by achievements..."
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                  />
                  {achievementInput && (
                    <button
                      type="button"
                      onClick={() => clearInput('achievement')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                  Projects
                </label>
                <div className="relative">
                  <Input
                    placeholder="Filter by projects..."
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                  />
                  {projectInput && (
                    <button
                      type="button"
                      onClick={() => clearInput('project')}
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
            <SelectTrigger className="w-[180px]">
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

export default EmployeeSearchFilters;
