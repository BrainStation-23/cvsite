import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import GraduationYearRangeControl from './GraduationYearRangeControl';
import TechnologyTagsInput from './TechnologyTagsInput';
import SkillTagsInput from './SkillTagsInput';

interface AdvancedFiltersPanelProps {
  skillInput: string;
  setSkillInput: (value: string) => void;
  universityInput: string;
  setUniversityInput: (value: string) => void;
  companyInput: string;
  setCompanyInput: (value: string) => void;
  technologyInput: string[];
  setTechnologyInput: (value: string[]) => void;
  projectNameInput: string;
  setProjectNameInput: (value: string) => void;
  projectDescriptionInput: string;
  setProjectDescriptionInput: (value: string) => void;
  experienceYears: number[];
  setExperienceYears: (value: number[]) => void;
  completionStatus: string;
  setCompletionStatus: (value: string) => void;
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  setMinGraduationYear: (year: number | null) => void;
  setMaxGraduationYear: (year: number | null) => void;
  onSkillFilter: (skill: string) => void;
  onCompanyFilter: (company: string) => void;
  onProjectNameFilter: (name: string) => void;
  onProjectDescriptionFilter: (description: string) => void;
  onTechnologyFilter: (technologies: string[]) => void;
  onAdvancedFilters: (filters: any) => void;
  onEducationFilter: (education: string) => void;
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
  projectNameInput,
  setProjectNameInput,
  projectDescriptionInput,
  setProjectDescriptionInput,
  experienceYears,
  setExperienceYears,
  completionStatus,
  setCompletionStatus,
  minGraduationYear,
  maxGraduationYear,
  setMinGraduationYear,
  setMaxGraduationYear,
  onSkillFilter,
  onCompanyFilter,
  onProjectNameFilter,
  onProjectDescriptionFilter,
  onTechnologyFilter,
  onAdvancedFilters,
  onEducationFilter,
  onClearAllFilters,
  isLoading
}) => {
  const handleSkillChange = (value: string) => {
    setSkillInput(value);
    onSkillFilter(value);
  };

  const handleUniversityChange = (value: string) => {
    setUniversityInput(value);
    onEducationFilter(value);
  };

  const handleCompanyChange = (value: string) => {
    setCompanyInput(value);
    onCompanyFilter(value);
  };

  const handleProjectNameChange = (value: string) => {
    setProjectNameInput(value);
    onProjectNameFilter(value);
  };

  const handleProjectDescriptionChange = (value: string) => {
    setProjectDescriptionInput(value);
    onProjectDescriptionFilter(value);
  };

  const handleTechnologyChange = (technologies: string[]) => {
    setTechnologyInput(technologies);
    onTechnologyFilter(technologies);
  };

  const handleExperienceYearsChange = (years: number[]) => {
    setExperienceYears(years);
    onAdvancedFilters({
      experienceYears: years,
      minGraduationYear,
      maxGraduationYear,
      completionStatus
    });
  };

  const handleGraduationYearChange = (minYear: number | null, maxYear: number | null) => {
    setMinGraduationYear(minYear);
    setMaxGraduationYear(maxYear);
    onAdvancedFilters({
      experienceYears,
      minGraduationYear: minYear,
      maxGraduationYear: maxYear,
      completionStatus
    });
  };

  const handleCompletionStatusChange = (status: string) => {
    setCompletionStatus(status);
    onAdvancedFilters({
      experienceYears,
      minGraduationYear,
      maxGraduationYear,
      completionStatus: status
    });
  };

  // Instead of Input, use SkillTagsInput for skills
  const handleSkillTagsChange = (skills: string[]) => {
    setSkillInput(skills.join(', ')); // join for backward compatibility with string filter
    onSkillFilter(skills.join(', ')); // if your filter accepts an array, just pass skills
  };

  return (
    <div className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border space-y-2">
      {/* Row 1: Skills & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">Skills</Label>
          </div>
          <SkillTagsInput
            value={skillInput ? skillInput.split(',').map(s=>s.trim()).filter(Boolean) : []}
            onChange={handleSkillTagsChange}
            placeholder="Search/add skills..."
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Label className="text-xs font-medium text-green-700 dark:text-green-300">Education</Label>
          </div>
          <UniversityCombobox
            value={universityInput}
            onValueChange={handleUniversityChange}
            placeholder="Search university..."
          />
        </div>
      </div>

      {/* Row 2: Company & Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Company</Label>
          </div>
          <Input
            placeholder="Search company..."
            value={companyInput}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="text-xs h-7 w-full"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Experience: {experienceYears[0]}-{experienceYears[1]} years
          </Label>
          <Slider
            value={experienceYears}
            onValueChange={handleExperienceYearsChange}
            max={20}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Row 3: Project Name & Description */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <Label className="text-xs font-medium text-orange-700 dark:text-orange-300">Projects</Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            placeholder="Project name..."
            value={projectNameInput}
            onChange={(e) => handleProjectNameChange(e.target.value)}
            className="text-xs h-7 w-full"
          />
          <Input
            placeholder="Project description..."
            value={projectDescriptionInput}
            onChange={(e) => handleProjectDescriptionChange(e.target.value)}
            className="text-xs h-7 w-full"
          />
        </div>
      </div>

      {/* Row 4: Technology Tags (Full Width) */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Technologies</Label>
        <TechnologyTagsInput
          value={technologyInput}
          onChange={handleTechnologyChange}
          placeholder="Add technologies..."
          disabled={isLoading}
        />
      </div>

      {/* Row 5: Graduation Years & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Graduation Years</Label>
          <GraduationYearRangeControl
            minYear={minGraduationYear}
            maxYear={maxGraduationYear}
            onMinYearChange={(year) => handleGraduationYearChange(year, maxGraduationYear)}
            onMaxYearChange={(year) => handleGraduationYearChange(minGraduationYear, year)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Profile Status</Label>
          <Select value={completionStatus} onValueChange={handleCompletionStatusChange}>
            <SelectTrigger className="text-xs h-7 w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              <SelectItem value="complete">Complete Profiles</SelectItem>
              <SelectItem value="incomplete">Incomplete Profiles</SelectItem>
              <SelectItem value="no-skills">Missing Skills</SelectItem>
              <SelectItem value="no-experience">Missing Experience</SelectItem>
              <SelectItem value="no-education">Missing Education</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear All Button */}
      <div className="pt-1 border-t">
        <Button 
          variant="outline" 
          onClick={onClearAllFilters}
          disabled={isLoading}
          className="text-xs h-7 w-full"
          size="sm"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFiltersPanel;
