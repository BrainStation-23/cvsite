
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { TrainingProviderCombobox } from '@/components/admin/training/TrainingProviderCombobox';
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
  trainingInput: string;
  setTrainingInput: (value: string) => void;
  achievementInput: string;
  setAchievementInput: (value: string) => void;
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
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
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
  trainingInput,
  setTrainingInput,
  achievementInput,
  setAchievementInput,
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
  onTrainingFilter,
  onAchievementFilter,
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

  const handleTrainingChange = (value: string) => {
    setTrainingInput(value);
    onTrainingFilter(value);
  };

  const handleAchievementChange = (value: string) => {
    setAchievementInput(value);
    onAchievementFilter(value);
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

  const handleSkillTagsChange = (skills: string[]) => {
    setSkillInput(skills.join(', '));
    onSkillFilter(skills.join(', '));
  };

  return (
    <div className="w-full space-y-4">
      {/* Professional Information Section */}
      <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">Skills</Label>
              <SkillTagsInput
                value={skillInput ? skillInput.split(',').map(s=>s.trim()).filter(Boolean) : []}
                onChange={handleSkillTagsChange}
                placeholder="Search/add skills..."
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">Company</Label>
              <Input
                placeholder="Search company..."
                value={companyInput}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="text-xs h-7 w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
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
        </CardContent>
      </Card>

      {/* Education & Training Section */}
      <Card className="border-green-200 bg-green-50/30 dark:bg-green-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Education & Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-green-700 dark:text-green-300">University</Label>
              <UniversityCombobox
                value={universityInput}
                onValueChange={handleUniversityChange}
                placeholder="Search university..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-green-700 dark:text-green-300">Training Provider</Label>
              <TrainingProviderCombobox
                value={trainingInput}
                onValueChange={handleTrainingChange}
                placeholder="Search training provider..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-green-700 dark:text-green-300">Graduation Years</Label>
            <GraduationYearRangeControl
              minYear={minGraduationYear}
              maxYear={maxGraduationYear}
              onMinYearChange={(year) => handleGraduationYearChange(year, maxGraduationYear)}
              onMaxYearChange={(year) => handleGraduationYearChange(minGraduationYear, year)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects & Achievements Section */}
      <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            Projects & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Project Name</Label>
              <Input
                placeholder="Project name..."
                value={projectNameInput}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                className="text-xs h-7 w-full"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Project Description</Label>
              <Input
                placeholder="Project description..."
                value={projectDescriptionInput}
                onChange={(e) => handleProjectDescriptionChange(e.target.value)}
                className="text-xs h-7 w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Technologies</Label>
            <TechnologyTagsInput
              value={technologyInput}
              onChange={handleTechnologyChange}
              placeholder="Add technologies..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Achievement</Label>
            <Input
              placeholder="Search achievements..."
              value={achievementInput}
              onChange={(e) => handleAchievementChange(e.target.value)}
              className="text-xs h-7 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Status Section */}
      <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            Profile Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-orange-700 dark:text-orange-300">Completion Status</Label>
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
        </CardContent>
      </Card>

      {/* Clear All Button */}
      <div className="pt-2 border-t">
        <Button 
          variant="outline" 
          onClick={onClearAllFilters}
          disabled={isLoading}
          className="text-xs h-8 w-full"
          size="sm"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFiltersPanel;
