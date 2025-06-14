
import { useMemo } from 'react';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'search' | 'skill' | 'experience' | 'education' | 'training' | 'achievement' | 'project' | 
        'experience-years' | 'graduation-years' | 'completion' | 
        'skill-input' | 'university-input' | 'company-input' | 'technology';
  tableSource?: string; // Add table source information
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

    // Applied filters (from previous searches)
    if (props.skillFilter) {
      filters.push({
        id: 'skill-applied',
        label: 'Skills Applied',
        value: props.skillFilter,
        type: 'skill',
        tableSource: 'technical_skills, specialized_skills'
      });
    }

    if (props.experienceFilter) {
      filters.push({
        id: 'experience-applied',
        label: 'Company Applied',
        value: props.experienceFilter,
        type: 'experience',
        tableSource: 'experiences'
      });
    }

    if (props.educationFilter) {
      filters.push({
        id: 'education-applied',
        label: 'Education Applied',
        value: props.educationFilter,
        type: 'education',
        tableSource: 'education, universities'
      });
    }

    if (props.trainingFilter) {
      filters.push({
        id: 'training-applied',
        label: 'Training Applied',
        value: props.trainingFilter,
        type: 'training',
        tableSource: 'trainings'
      });
    }

    if (props.achievementFilter) {
      filters.push({
        id: 'achievement-applied',
        label: 'Achievement Applied',
        value: props.achievementFilter,
        type: 'achievement',
        tableSource: 'achievements'
      });
    }

    if (props.projectFilter) {
      filters.push({
        id: 'project-applied',
        label: 'Project Tech Applied',
        value: props.projectFilter,
        type: 'project',
        tableSource: 'projects.technologies_used'
      });
    }

    // Advanced filter inputs (pending application)
    if (props.skillInput) {
      filters.push({
        id: 'skill-input',
        label: 'Skills (pending)',
        value: props.skillInput,
        type: 'skill-input',
        tableSource: 'technical_skills, specialized_skills'
      });
    }

    if (props.universityInput) {
      filters.push({
        id: 'university-input',
        label: 'University (pending)',
        value: props.universityInput,
        type: 'university-input',
        tableSource: 'education, universities'
      });
    }

    if (props.companyInput) {
      filters.push({
        id: 'company-input',
        label: 'Company (pending)',
        value: props.companyInput,
        type: 'company-input',
        tableSource: 'experiences'
      });
    }

    // Technology filters (each technology as separate chip)
    props.technologyInput.forEach((tech, index) => {
      filters.push({
        id: `technology-${index}`,
        label: 'Project Tech (pending)',
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
    props.technologyInput
  ]);

  return { activeFilters };
};
