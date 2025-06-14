
import React from 'react';

interface AdvancedFiltersManagerProps {
  skillInput: string;
  universityInput: string;
  companyInput: string;
  technologyInput: string[];
  projectNameInput: string;
  projectDescriptionInput: string;
  experienceYears: number[];
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  completionStatus: string;
  onSkillFilter: (skill: string) => void;
  onExperienceFilter: (experience: string) => void;
  onProjectFilter: (project: string) => void;
  onAdvancedFilters: (filters: {
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
  }) => void;
  setSkillInput: (skill: string) => void;
  setUniversityInput: (university: string) => void;
  setCompanyInput: (company: string) => void;
  setTechnologyInput: (tech: string[]) => void;
  setProjectNameInput: (name: string) => void;
  setProjectDescriptionInput: (description: string) => void;
  setExperienceYears: (years: number[]) => void;
  setMinGraduationYear: (year: number | null) => void;
  setMaxGraduationYear: (year: number | null) => void;
  setCompletionStatus: (status: string) => void;
  onReset: () => void;
}

export const useAdvancedFiltersManager = (props: AdvancedFiltersManagerProps) => {
  // Apply filters immediately when values change
  const applySkillFilter = (skill: string) => {
    props.setSkillInput(skill);
    props.onSkillFilter(skill);
  };

  const applyCompanyFilter = (company: string) => {
    props.setCompanyInput(company);
    props.onExperienceFilter(company);
  };

  const applyProjectNameFilter = (name: string) => {
    props.setProjectNameInput(name);
    if (name.trim()) {
      props.onProjectFilter(name);
    } else {
      props.onProjectFilter('');
    }
  };

  const applyProjectDescriptionFilter = (description: string) => {
    props.setProjectDescriptionInput(description);
    if (description.trim()) {
      props.onProjectFilter(description);
    } else {
      props.onProjectFilter('');
    }
  };

  const applyTechnologyFilter = (technologies: string[]) => {
    props.setTechnologyInput(technologies);
    if (technologies.length > 0) {
      props.onProjectFilter(technologies[0]); // Use first technology for search
    } else {
      props.onProjectFilter('');
    }
  };

  const applyAdvancedFilters = (updates: Partial<{
    experienceYears: number[];
    minGraduationYear: number | null;
    maxGraduationYear: number | null;
    completionStatus: string;
  }>) => {
    // Update local state
    if (updates.experienceYears) props.setExperienceYears(updates.experienceYears);
    if (updates.minGraduationYear !== undefined) props.setMinGraduationYear(updates.minGraduationYear);
    if (updates.maxGraduationYear !== undefined) props.setMaxGraduationYear(updates.maxGraduationYear);
    if (updates.completionStatus) props.setCompletionStatus(updates.completionStatus);

    // Apply filters immediately
    const currentExperienceYears = updates.experienceYears || props.experienceYears;
    const currentMinGradYear = updates.minGraduationYear !== undefined ? updates.minGraduationYear : props.minGraduationYear;
    const currentMaxGradYear = updates.maxGraduationYear !== undefined ? updates.maxGraduationYear : props.maxGraduationYear;
    const currentCompletionStatus = updates.completionStatus || props.completionStatus;

    props.onAdvancedFilters({
      minExperienceYears: currentExperienceYears[0] > 0 || currentExperienceYears[1] < 20 ? currentExperienceYears[0] : null,
      maxExperienceYears: currentExperienceYears[0] > 0 || currentExperienceYears[1] < 20 ? currentExperienceYears[1] : null,
      minGraduationYear: currentMinGradYear,
      maxGraduationYear: currentMaxGradYear,
      completionStatus: currentCompletionStatus !== 'all' ? currentCompletionStatus : null
    });
  };

  const clearAllFilters = () => {
    console.log('Clearing all filters');
    
    // Reset all local state
    props.setSkillInput('');
    props.setUniversityInput('');
    props.setCompanyInput('');
    props.setProjectNameInput('');
    props.setProjectDescriptionInput('');
    props.setTechnologyInput([]);
    props.setExperienceYears([0, 20]);
    props.setMinGraduationYear(null);
    props.setMaxGraduationYear(null);
    props.setCompletionStatus('all');
    
    // Reset backend filters
    props.onReset();
  };

  return { 
    applySkillFilter,
    applyCompanyFilter,
    applyProjectNameFilter,
    applyProjectDescriptionFilter,
    applyTechnologyFilter,
    applyAdvancedFilters,
    clearAllFilters 
  };
};
