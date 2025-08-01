import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  EmployeeProfileSortColumn, 
  EmployeeProfileSortOrder 
} from '@/hooks/types/employee-profiles';
import CompactSearchHeader from './CompactSearchHeader';
import VerticalFilterChips from './VerticalFilterChips';
import CollapsibleFilterSection from './CollapsibleFilterSection';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Filter,
  TrendingUp,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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
  onResourcePlanningFilters: (filters: {
    minEngagementPercentage?: number | null;
    maxEngagementPercentage?: number | null;
    minBillingPercentage?: number | null;
    maxBillingPercentage?: number | null;
    releaseDateFrom?: Date | null;
    releaseDateTo?: Date | null;
    availabilityStatus?: string | null;
    currentProjectSearch?: string | null;
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
  onResourcePlanningFilters,
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
  
  // Resource planning filter states
  const [engagementRange, setEngagementRange] = useState<number[]>([0, 100]);
  const [billingRange, setBillingRange] = useState<number[]>([0, 100]);
  const [releaseDateFrom, setReleaseDateFrom] = useState<Date | null>(null);
  const [releaseDateTo, setReleaseDateTo] = useState<Date | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('all');
  const [currentProjectSearch, setCurrentProjectSearch] = useState<string>('');
  const [isResourcePlanningOpen, setIsResourcePlanningOpen] = useState(false);
  
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

  const handleResourcePlanningFilter = () => {
    onResourcePlanningFilters({
      minEngagementPercentage: engagementRange[0] > 0 ? engagementRange[0] : null,
      maxEngagementPercentage: engagementRange[1] < 100 ? engagementRange[1] : null,
      minBillingPercentage: billingRange[0] > 0 ? billingRange[0] : null,
      maxBillingPercentage: billingRange[1] < 100 ? billingRange[1] : null,
      releaseDateFrom,
      releaseDateTo,
      availabilityStatus: availabilityStatus !== 'all' ? availabilityStatus : null,
      currentProjectSearch: currentProjectSearch || null,
    });
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
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <VerticalFilterChips
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
              onClearAllFilters={clearAllFilters}
              highlightedFilters={highlightedFilters}
            />
          )}

          {/* Resource Planning Filters */}
          <Collapsible open={isResourcePlanningOpen} onOpenChange={setIsResourcePlanningOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Resource Planning
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isResourcePlanningOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              {/* Availability Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Availability Status</Label>
                <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="engaged">Engaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Project Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Project</Label>
                <div className="relative">
                  <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search current project..."
                    value={currentProjectSearch}
                    onChange={(e) => setCurrentProjectSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Engagement Percentage Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Engagement Percentage</Label>
                <div className="px-2">
                  <Slider
                    value={engagementRange}
                    onValueChange={setEngagementRange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{engagementRange[0]}%</span>
                    <span>{engagementRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Billing Percentage Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Billing Percentage</Label>
                <div className="px-2">
                  <Slider
                    value={billingRange}
                    onValueChange={setBillingRange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{billingRange[0]}%</span>
                    <span>{billingRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Release Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Release Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !releaseDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {releaseDateFrom ? format(releaseDateFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={releaseDateFrom}
                        onSelect={setReleaseDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !releaseDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {releaseDateTo ? format(releaseDateTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={releaseDateTo}
                        onSelect={setReleaseDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                onClick={handleResourcePlanningFilter}
                className="w-full mt-3"
                disabled={isLoading}
              >
                Apply Resource Planning Filters
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <CollapsibleFilterSection
            title="Projects & Tech"
            icon="code"
            defaultOpen={true}
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
