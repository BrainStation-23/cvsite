
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Calendar, X } from 'lucide-react';
import { TechnicalSkillInput } from '@/components/profile/skills/TechnicalSkillInput';

interface AdvancedFiltersPanelProps {
  skillInput: string;
  setSkillInput: (value: string) => void;
  universityInput: string;
  setUniversityInput: (value: string) => void;
  companyInput: string;
  setCompanyInput: (value: string) => void;
  technologyInput: string;
  setTechnologyInput: (value: string) => void;
  experienceYears: number[];
  setExperienceYears: (value: number[]) => void;
  completionStatus: string;
  setCompletionStatus: (value: string) => void;
  graduationDateRange: DateRange | undefined;
  setGraduationDateRange: (value: DateRange | undefined) => void;
  onApplyFilters: () => void;
  onClearAllFilters: () => void;
  isLoading: boolean;
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  skillInput,
  setSkillInput,
  universityInput,
  setUniversityInput,
  companyInput,
  setCompanyInput,
  technologyInput,
  setTechnologyInput,
  experienceYears,
  setExperienceYears,
  completionStatus,
  setCompletionStatus,
  graduationDateRange,
  setGraduationDateRange,
  onApplyFilters,
  onClearAllFilters,
  isLoading
}) => {
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [tempTechInput, setTempTechInput] = useState('');

  const handleTechnologyAdd = (technology: string) => {
    if (technology && !selectedTechnologies.includes(technology)) {
      const newTechnologies = [...selectedTechnologies, technology];
      setSelectedTechnologies(newTechnologies);
      setTechnologyInput(newTechnologies.join(', '));
      setTempTechInput('');
    }
  };

  const handleTechnologyRemove = (technology: string) => {
    const newTechnologies = selectedTechnologies.filter(tech => tech !== technology);
    setSelectedTechnologies(newTechnologies);
    setTechnologyInput(newTechnologies.join(', '));
  };

  const handleTempInputChange = (value: string) => {
    setTempTechInput(value);
    if (value.includes(',')) {
      const techs = value.split(',').map(t => t.trim()).filter(t => t);
      techs.forEach(tech => handleTechnologyAdd(tech));
      setTempTechInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tempTechInput.trim()) {
      e.preventDefault();
      handleTechnologyAdd(tempTechInput.trim());
    }
  };

  return (
    <div className="mt-6">
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

        {/* Enhanced Technology Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Technologies
          </label>
          <div className="space-y-2">
            <TechnicalSkillInput
              value={tempTechInput}
              onChange={handleTempInputChange}
              placeholder="Search and select technologies..."
              className="w-full"
            />
            <div className="min-h-[32px]">
              {selectedTechnologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTechnologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      {tech}
                      <button
                        onClick={() => handleTechnologyRemove(tech)}
                        className="ml-1 hover:text-red-500"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
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
        <Button onClick={onApplyFilters} disabled={isLoading}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={onClearAllFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFiltersPanel;
