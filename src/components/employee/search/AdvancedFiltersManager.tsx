
import React from 'react';

interface AdvancedFiltersManagerProps {
  skillInput: string;
  universityInput: string;
  companyInput: string;
  technologyInput: string[];
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
  setExperienceYears: (years: number[]) => void;
  setMinGraduationYear: (year: number | null) => void;
  setMaxGraduationYear: (year: number | null) => void;
  setCompletionStatus: (status: string) => void;
  onReset: () => void;
}

export const useAdvancedFiltersManager = (props: AdvancedFiltersManagerProps) => {
  const handleApplyAdvancedFilters = () => {
    console.log('Applying advanced filters:', {
      skillInput: props.skillInput,
      universityInput: props.universityInput, 
      companyInput: props.companyInput,
      technologyInput: props.technologyInput,
      experienceYears: props.experienceYears,
      minGraduationYear: props.minGraduationYear,
      maxGraduationYear: props.maxGraduationYear,
      completionStatus: props.completionStatus
    });

    if (props.skillInput) {
      props.onSkillFilter(props.skillInput);
    }

    if (props.companyInput) {
      props.onExperienceFilter(props.companyInput);
    }

    // Apply each technology as a separate project filter search
    if (props.technologyInput.length > 0) {
      // For now, we'll search for the first technology as the primary filter
      // In a more advanced implementation, we could modify the backend to handle multiple technologies
      props.onProjectFilter(props.technologyInput[0]);
    }

    props.onAdvancedFilters({
      minExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[0] : null,
      maxExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[1] : null,
      minGraduationYear: props.minGraduationYear,
      maxGraduationYear: props.maxGraduationYear,
      completionStatus: props.completionStatus !== 'all' ? props.completionStatus : null
    });
  };

  const clearAllFilters = () => {
    props.setSkillInput('');
    props.setUniversityInput('');
    props.setCompanyInput('');
    props.setTechnologyInput([]);
    props.setExperienceYears([0, 20]);
    props.setMinGraduationYear(null);
    props.setMaxGraduationYear(null);
    props.setCompletionStatus('all');
    props.onReset();
  };

  return { handleApplyAdvancedFilters, clearAllFilters };
};

