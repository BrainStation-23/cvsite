
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

interface AdvancedFiltersPanelProps {
  skillInput: string;
  setSkillInput: (value: string) => void;
  universityInput: string;
  setUniversityInput: (value: string) => void;
  companyInput: string;
  setCompanyInput: (value: string) => void;
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Table Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-blue-700 dark:text-blue-300">
              Skills Filters
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search in technical_skills and specialized_skills tables
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-input" className="text-sm font-medium">
                Skill Name
              </Label>
              <Input
                id="skill-input"
                placeholder="Search by skill name..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Education Table Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-green-700 dark:text-green-300">
              Education Filters
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search in education and universities tables
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <GraduationYearRangeControl
              minYear={minGraduationYear}
              maxYear={maxGraduationYear}
              onMinYearChange={setMinGraduationYear}
              onMaxYearChange={setMaxGraduationYear}
            />
          </CardContent>
        </Card>

        {/* Experience Table Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-purple-700 dark:text-purple-300">
              Experience Filters
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search in experiences table
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-input" className="text-sm font-medium">
                Company Name
              </Label>
              <Input
                id="company-input"
                placeholder="Search by company name..."
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Total Experience: {experienceYears[0]}-{experienceYears[1]} years
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
          </CardContent>
        </Card>

        {/* Projects Table Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-orange-700 dark:text-orange-300">
              Projects Filters
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search in projects table (technologies_used column)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Technologies Used
              </Label>
              <TechnologyTagsInput
                value={technologyInput}
                onChange={setTechnologyInput}
                placeholder="Add project technologies..."
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Status Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-gray-700 dark:text-gray-300">
            Profile Status
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Filter by profile completion status
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-sm">
            <Label className="text-sm font-medium">
              Completion Status
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
        </CardContent>
      </Card>

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
