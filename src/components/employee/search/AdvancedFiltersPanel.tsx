import React from 'react';
import { Button } from '@/components/ui/button';
import ProfessionalFiltersSection from './sections/ProfessionalFiltersSection';
import EducationFiltersSection from './sections/EducationFiltersSection';
import ProjectsFiltersSection from './sections/ProjectsFiltersSection';
import ProfileStatusSection from './sections/ProfileStatusSection';

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
  const handleSkillChange = (skills: string[]) => {
    const skillString = skills.join(', ');
    setSkillInput(skillString);
    onSkillFilter(skillString);
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

  // Simplified experience years handler - directly call onAdvancedFilters
  const handleExperienceYearsChange = (years: number[]) => {
    console.log('AdvancedFiltersPanel - Experience years changed:', years);
    console.log('Current state - minGraduationYear:', minGraduationYear, 'maxGraduationYear:', maxGraduationYear, 'completionStatus:', completionStatus);
    
    setExperienceYears(years);
    
    const filters = {
      minExperienceYears: years[0] || null,
      maxExperienceYears: years[1] || null,
      minGraduationYear,
      maxGraduationYear,
      completionStatus: completionStatus === 'all' ? null : completionStatus
    };
    
    console.log('AdvancedFiltersPanel - Calling onAdvancedFilters with:', filters);
    onAdvancedFilters(filters);
  };

  const handleGraduationYearChange = (minYear: number | null, maxYear: number | null) => {
    setMinGraduationYear(minYear);
    setMaxGraduationYear(maxYear);
    onAdvancedFilters({
      minExperienceYears: experienceYears[0] || null,
      maxExperienceYears: experienceYears[1] || null,
      minGraduationYear: minYear,
      maxGraduationYear: maxYear,
      completionStatus: completionStatus === 'all' ? null : completionStatus
    });
  };

  const handleCompletionStatusChange = (status: string) => {
    setCompletionStatus(status);
    onAdvancedFilters({
      minExperienceYears: experienceYears[0] || null,
      maxExperienceYears: experienceYears[1] || null,
      minGraduationYear,
      maxGraduationYear,
      completionStatus: status === 'all' ? null : status
    });
  };

  return (
    <div className="w-full space-y-4">
      <ProfessionalFiltersSection
        skillInput={skillInput}
        companyInput={companyInput}
        experienceYears={experienceYears}
        onSkillFilter={handleSkillChange}
        onCompanyFilter={handleCompanyChange}
        onExperienceYearsChange={handleExperienceYearsChange}
        isLoading={isLoading}
      />

      <EducationFiltersSection
        universityInput={universityInput}
        trainingInput={trainingInput}
        minGraduationYear={minGraduationYear}
        maxGraduationYear={maxGraduationYear}
        onUniversityChange={handleUniversityChange}
        onTrainingChange={handleTrainingChange}
        onGraduationYearChange={handleGraduationYearChange}
        isLoading={isLoading}
      />

      <ProjectsFiltersSection
        projectNameInput={projectNameInput}
        projectDescriptionInput={projectDescriptionInput}
        technologyInput={technologyInput}
        achievementInput={achievementInput}
        onProjectNameChange={handleProjectNameChange}
        onProjectDescriptionChange={handleProjectDescriptionChange}
        onTechnologyChange={handleTechnologyChange}
        onAchievementChange={handleAchievementChange}
        isLoading={isLoading}
      />

      <ProfileStatusSection
        completionStatus={completionStatus}
        onCompletionStatusChange={handleCompletionStatusChange}
      />

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
