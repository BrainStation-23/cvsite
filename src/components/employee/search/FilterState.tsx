
import { useState, useEffect } from 'react';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: string;
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
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);

  useEffect(() => {
    const filters: FilterChip[] = [];
    
    if (props.searchQuery) {
      filters.push({ id: 'search', label: `Search: "${props.searchQuery}"`, value: props.searchQuery, type: 'search' });
    }
    
    if (props.skillFilter) {
      filters.push({ id: 'skill', label: `Skills: ${props.skillFilter}`, value: props.skillFilter, type: 'skill' });
    }
    
    if (props.experienceFilter) {
      filters.push({ id: 'experience', label: `Experience: ${props.experienceFilter}`, value: props.experienceFilter, type: 'experience' });
    }
    
    if (props.educationFilter) {
      filters.push({ id: 'education', label: `Education: ${props.educationFilter}`, value: props.educationFilter, type: 'education' });
    }
    
    if (props.trainingFilter) {
      filters.push({ id: 'training', label: `Training: ${props.trainingFilter}`, value: props.trainingFilter, type: 'training' });
    }
    
    if (props.achievementFilter) {
      filters.push({ id: 'achievement', label: `Achievements: ${props.achievementFilter}`, value: props.achievementFilter, type: 'achievement' });
    }
    
    if (props.projectFilter) {
      filters.push({ id: 'project', label: `Projects: ${props.projectFilter}`, value: props.projectFilter, type: 'project' });
    }

    if (props.experienceYears[0] > 0 || props.experienceYears[1] < 20) {
      filters.push({ 
        id: 'experience-years', 
        label: `Experience: ${props.experienceYears[0]}-${props.experienceYears[1]} years`, 
        value: props.experienceYears.join('-'), 
        type: 'experience-years' 
      });
    }

    if (props.minGraduationYear || props.maxGraduationYear) {
      const yearRange = `${props.minGraduationYear || 'Any'}-${props.maxGraduationYear || 'Any'}`;
      filters.push({ 
        id: 'graduation-years', 
        label: `Graduation: ${yearRange}`, 
        value: yearRange, 
        type: 'graduation-years' 
      });
    }

    if (props.completionStatus !== 'all') {
      filters.push({ 
        id: 'completion', 
        label: `Status: ${props.completionStatus}`, 
        value: props.completionStatus, 
        type: 'completion' 
      });
    }

    if (props.skillInput) {
      filters.push({ 
        id: 'skill-input', 
        label: `Skills: ${props.skillInput}`, 
        value: props.skillInput, 
        type: 'skill-input' 
      });
    }

    if (props.universityInput && props.universityInput !== props.educationFilter) {
      filters.push({ 
        id: 'university-input', 
        label: `Education: ${props.universityInput}`, 
        value: props.universityInput, 
        type: 'university-input' 
      });
    }

    if (props.companyInput) {
      filters.push({ 
        id: 'company-input', 
        label: `Company: ${props.companyInput}`, 
        value: props.companyInput, 
        type: 'company-input' 
      });
    }

    if (props.technologyInput.length > 0) {
      props.technologyInput.forEach((tech, index) => {
        filters.push({ 
          id: `technology-${index}`, 
          label: `Technology: ${tech}`, 
          value: tech, 
          type: 'technology' 
        });
      });
    }
    
    setActiveFilters(filters);
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

export type { FilterChip };
