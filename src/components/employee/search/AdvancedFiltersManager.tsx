
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
    console.log('Applying advanced filters with table-grouped data:', {
      // Skills table filters
      skillsTable: {
        skillInput: props.skillInput
      },
      // Education table filters
      educationTable: {
        universityInput: props.universityInput,
        minGraduationYear: props.minGraduationYear,
        maxGraduationYear: props.maxGraduationYear
      },
      // Experience table filters
      experienceTable: {
        companyInput: props.companyInput,
        experienceYears: props.experienceYears
      },
      // Projects table filters
      projectsTable: {
        technologyInput: props.technologyInput
      },
      // Profile status
      profileStatus: {
        completionStatus: props.completionStatus
      }
    });

    // Apply Skills table filter (technical_skills, specialized_skills)
    if (props.skillInput) {
      console.log('Applying skills table filter:', props.skillInput);
      props.onSkillFilter(props.skillInput);
    }

    // Apply Experience table filter (experiences.company_name)
    if (props.companyInput) {
      console.log('Applying experience table filter for company:', props.companyInput);
      props.onExperienceFilter(props.companyInput);
    }

    // Apply Projects table filter (projects.technologies_used)
    if (props.technologyInput.length > 0) {
      console.log('Applying projects table filter for technologies:', props.technologyInput);
      // Apply first technology as project filter (searches in technologies_used array)
      props.onProjectFilter(props.technologyInput[0]);
    }

    // Apply advanced filters for experience years, graduation years, and completion status
    props.onAdvancedFilters({
      minExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[0] : null,
      maxExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[1] : null,
      minGraduationYear: props.minGraduationYear,
      maxGraduationYear: props.maxGraduationYear,
      completionStatus: props.completionStatus !== 'all' ? props.completionStatus : null
    });
  };

  const clearAllFilters = () => {
    console.log('Clearing all table-grouped filters');
    
    // Reset Skills table filters
    props.setSkillInput('');
    
    // Reset Education table filters
    props.setUniversityInput('');
    props.setMinGraduationYear(null);
    props.setMaxGraduationYear(null);
    
    // Reset Experience table filters
    props.setCompanyInput('');
    props.setExperienceYears([0, 20]);
    
    // Reset Projects table filters
    props.setTechnologyInput([]);
    
    // Reset Profile status
    props.setCompletionStatus('all');
    
    props.onReset();
  };

  return { handleApplyAdvancedFilters, clearAllFilters };
};
