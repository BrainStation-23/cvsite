import { useMemo } from 'react';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'search' | 'skill' | 'experience' | 'education' | 'training' | 'achievement' | 'project' | 
        'experience-years' | 'graduation-years' | 'completion' | 
        'skill-input' | 'university-input' | 'company-input' | 'technology' | 
        'project-name-input' | 'project-description-input';
  tableSource?: string;
}

interface FilterStateProps {
  searchQuery: string;
  skillFilter: string;
  experienceFilter: string;
  educationFilter: string;
  trainingFilter: string;
  achievementFilter: string;
  projectFilter: string;
  experienceYears: number[];
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  completionStatus: string;
  skillInput: string;
  universityInput: string;
  companyInput: string;
  technologyInput: string[];
  projectNameInput: string;
  projectDescriptionInput: string;
}

export const useFilterState = (props: FilterStateProps) => {
  const activeFilters = useMemo(() => {
    const filters: FilterChip[] = [];

    // Global search
    if (props.searchQuery) {
      filters.push({
        id: 'search',
        label: 'Search',
        value: props.searchQuery,
        type: 'search',
        tableSource: 'All tables'
      });
    }

    // Skills table filters
    if (props.skillFilter || props.skillInput) {
      const value = props.skillFilter || props.skillInput;
      filters.push({
        id: 'skill',
        label: 'Skills',
        value: value,
        type: 'skill',
        tableSource: 'technical_skills, specialized_skills'
      });
    }

    // Education table filters
    if (props.educationFilter || props.universityInput) {
      const value = props.educationFilter || props.universityInput;
      filters.push({
        id: 'education',
        label: 'University',
        value: value,
        type: 'education',
        tableSource: 'education, universities'
      });
    }

    // Experience table filters
    if (props.experienceFilter || props.companyInput) {
      const value = props.experienceFilter || props.companyInput;
      filters.push({
        id: 'experience',
        label: 'Company',
        value: value,
        type: 'experience',
        tableSource: 'experiences'
      });
    }

    // Projects table filters
    if (props.projectFilter || props.projectNameInput || props.projectDescriptionInput) {
      const value = props.projectFilter || props.projectNameInput || props.projectDescriptionInput;
      const label = props.projectNameInput ? 'Project Name' : 
                   props.projectDescriptionInput ? 'Project Description' : 'Project';
      filters.push({
        id: 'project',
        label: label,
        value: value,
        type: 'project',
        tableSource: 'projects'
      });
    }

    // Other applied filters
    if (props.trainingFilter) {
      filters.push({
        id: 'training',
        label: 'Training',
        value: props.trainingFilter,
        type: 'training',
        tableSource: 'trainings'
      });
    }

    if (props.achievementFilter) {
      filters.push({
        id: 'achievement',
        label: 'Achievement',
        value: props.achievementFilter,
        type: 'achievement',
        tableSource: 'achievements'
      });
    }

    // Technology filters (each technology as separate chip)
    props.technologyInput.forEach((tech, index) => {
      filters.push({
        id: `technology-${index}`,
        label: 'Project Technology',
        value: tech,
        type: 'technology',
        tableSource: 'projects.technologies_used'
      });
    });

    // Experience years range
    if (props.experienceYears[0] > 0 || props.experienceYears[1] < 20) {
      filters.push({
        id: 'experience-years',
        label: 'Experience Range',
        value: `${props.experienceYears[0]}-${props.experienceYears[1]} years`,
        type: 'experience-years',
        tableSource: 'experiences (calculated)'
      });
    }

    // Graduation years range
    if (props.minGraduationYear || props.maxGraduationYear) {
      const minYear = props.minGraduationYear || 'any';
      const maxYear = props.maxGraduationYear || 'any';
      filters.push({
        id: 'graduation-years',
        label: 'Graduation Range',
        value: `${minYear} - ${maxYear}`,
        type: 'graduation-years',
        tableSource: 'education'
      });
    }

    // Completion status
    if (props.completionStatus !== 'all') {
      const statusLabels = {
        'complete': 'Complete Profiles',
        'incomplete': 'Incomplete Profiles',
        'no-skills': 'Missing Skills',
        'no-experience': 'Missing Experience',
        'no-education': 'Missing Education'
      };
      
      filters.push({
        id: 'completion',
        label: 'Profile Status',
        value: statusLabels[props.completionStatus as keyof typeof statusLabels] || props.completionStatus,
        type: 'completion',
        tableSource: 'Profile analysis'
      });
    }

    return filters;
  }, [
    props.searchQuery,
    props.skillFilter,
    props.experienceFilter,
    props.educationFilter,
    props.trainingFilter,
    props.achievementFilter,
    props.projectFilter,
    props.experienceYears,
    props.minGraduationYear,
    props.maxGraduationYear,
    props.completionStatus,
    props.skillInput,
    props.universityInput,
    props.companyInput,
    props.technologyInput,
    props.projectNameInput,
    props.projectDescriptionInput
  ]);

  return { activeFilters };
};
