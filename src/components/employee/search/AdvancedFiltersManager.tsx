
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
        projectNameInput: props.projectNameInput,
        projectDescriptionInput: props.projectDescriptionInput,
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

    // Apply Projects table filters (projects.name, projects.description, projects.technologies_used)
    let projectSearchTerm = '';
    
    if (props.projectNameInput) {
      projectSearchTerm = props.projectNameInput;
      console.log('Applying projects table filter for name:', props.projectNameInput);
    } else if (props.projectDescriptionInput) {
      projectSearchTerm = props.projectDescriptionInput;
      console.log('Applying projects table filter for description:', props.projectDescriptionInput);
    } else if (props.technologyInput.length > 0) {
      projectSearchTerm = props.technologyInput[0];
      console.log('Applying projects table filter for technologies:', props.technologyInput);
    }
    
    if (projectSearchTerm) {
      props.onProjectFilter(projectSearchTerm);
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
    props.setProjectNameInput('');
    props.setProjectDescriptionInput('');
    props.setTechnologyInput([]);
    
    // Reset Profile status
    props.setCompletionStatus('all');
    
    props.onReset();
  };

  return { handleApplyAdvancedFilters, clearAllFilters };
};
