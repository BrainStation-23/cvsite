
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import GraduationYearRangeControl from './GraduationYearRangeControl';
import TechnologyTagsInput from './TechnologyTagsInput';

interface AdvancedFiltersPanelProps {
  skillInput: string;
  setSkillInput: (value: string) => void;
  universityInput: string;
  setUniversityInput: (value: string) => void;
  companyInput: string;
  setCompanyInput: (value: string) => void;
  projectInput: string;
  setProjectInput: (value: string) => void;
  technologyInput: string[];
  setTechnologyInput: (value: string[]) => void;
  experienceYears: number[];
  setExperienceYears: (value: number[]) => void;
  completionStatus: string;
  setCompletionStatus: (value: string) => void;
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  setMinGraduationYear: (year: number | null) => void;
  setMaxGraduationYear: (year: number | null) => void;
  onApplyFilters: () => void;
  onClearAllFilters: () => void;
  onEducationFilter: (education: string) => void;
  isLoading: boolean;
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  skillInput,
  setSkillInput,
  universityInput,
  setUniversityInput,
  companyInput,
  setCompanyInput,
  projectInput,
  setProjectInput,
  technologyInput,
  setTechnologyInput,
  experienceYears,
  setExperienceYears,
  completionStatus,
  setCompletionStatus,
  minGraduationYear,
  maxGraduationYear,
  setMinGraduationYear,
  setMaxGraduationYear,
  onApplyFilters,
  onClearAllFilters,
  onEducationFilter,
  isLoading
}) => {
  const handleUniversityChange = (value: string) => {
    setUniversityInput(value);
    // Trigger immediate search when university is selected
    onEducationFilter(value);
  };

  return (
    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Skills Filter */}
        <div className="space-y-2">
          <Label htmlFor="skill-input" className="text-sm font-medium">
            Skills
          </Label>
          <Input
            id="skill-input"
            placeholder="Search by skills..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* University Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            University
          </Label>
          <UniversityCombobox
            value={universityInput}
            onValueChange={handleUniversityChange}
            placeholder="Search by university..."
          />
        </div>

        {/* Company Filter */}
        <div className="space-y-2">
          <Label htmlFor="company-input" className="text-sm font-medium">
            Company
          </Label>
          <Input
            id="company-input"
            placeholder="Search by company..."
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Project Filter */}
        <div className="space-y-2">
          <Label htmlFor="project-input" className="text-sm font-medium">
            Project
          </Label>
          <Input
            id="project-input"
            placeholder="Search by project name..."
            value={projectInput}
            onChange={(e) => setProjectInput(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Technology Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Technologies
          </Label>
          <TechnologyTagsInput
            value={technologyInput}
            onChange={setTechnologyInput}
            placeholder="Add technologies..."
            disabled={isLoading}
          />
        </div>

        {/* Experience Years Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Experience Range: {experienceYears[0]}-{experienceYears[1]} years
          </Label>
          <Slider
            value={experienceYears}
            onValueChange={setExperienceYears}
            max={20}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Graduation Year Range */}
        <GraduationYearRangeControl
          minYear={minGraduationYear}
          maxYear={maxGraduationYear}
          onMinYearChange={setMinGraduationYear}
          onMaxYearChange={setMaxGraduationYear}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Completion Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Profile Status
          </Label>
          <Select value={completionStatus} onValueChange={setCompletionStatus}>
            <SelectTrigger className="text-sm">
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onClearAllFilters}
          disabled={isLoading}
          className="text-sm"
        >
          Clear All Filters
        </Button>
        <Button 
          onClick={onApplyFilters}
          disabled={isLoading}
          className="text-sm"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFiltersPanel;
