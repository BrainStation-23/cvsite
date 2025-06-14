
import React from 'react';
import { FilterChip } from './FilterState';

interface FilterChipsManagerProps {
  activeFilters: FilterChip[];
  experienceYears: number[];
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  completionStatus: string;
  onSearch: (query: string) => void;
  onSkillFilter: (skill: string) => void;
  onExperienceFilter: (experience: string) => void;
  onEducationFilter: (education: string) => void;
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
  onProjectFilter: (project: string) => void;
  onAdvancedFilters: (filters: {
    minExperienceYears?: number | null;
    maxExperienceYears?: number | null;
    minGraduationYear?: number | null;
    maxGraduationYear?: number | null;
    completionStatus?: string | null;
  }) => void;
  setExperienceYears: (years: number[]) => void;
  setMinGraduationYear: (year: number | null) => void;
  setMaxGraduationYear: (year: number | null) => void;
  setCompletionStatus: (status: string) => void;
  setSkillInput: (skill: string) => void;
  setUniversityInput: (university: string) => void;
  setCompanyInput: (company: string) => void;
  setTechnologyInput: (tech: string[]) => void;
}

export const useFilterChipsManager = (props: FilterChipsManagerProps) => {
  const removeFilter = (filterId: string) => {
    const filter = props.activeFilters.find(f => f.id === filterId);
    if (!filter) return;

    switch (filter.type) {
      case 'search':
        props.onSearch('');
        break;
      case 'skill':
        props.onSkillFilter('');
        break;
      case 'experience':
        props.onExperienceFilter('');
        break;
      case 'education':
        props.onEducationFilter('');
        break;
      case 'training':
        props.onTrainingFilter('');
        break;
      case 'achievement':
        props.onAchievementFilter('');
        break;
      case 'project':
        props.onProjectFilter('');
        break;
      case 'experience-years':
        props.setExperienceYears([0, 20]);
        props.onAdvancedFilters({
          minExperienceYears: null,
          maxExperienceYears: null,
          minGraduationYear: props.minGraduationYear,
          maxGraduationYear: props.maxGraduationYear,
          completionStatus: props.completionStatus !== 'all' ? props.completionStatus : null
        });
        break;
      case 'graduation-years':
        props.setMinGraduationYear(null);
        props.setMaxGraduationYear(null);
        props.onAdvancedFilters({
          minExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[0] : null,
          maxExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[1] : null,
          minGraduationYear: null,
          maxGraduationYear: null,
          completionStatus: props.completionStatus !== 'all' ? props.completionStatus : null
        });
        break;
      case 'completion':
        props.setCompletionStatus('all');
        props.onAdvancedFilters({
          minExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[0] : null,
          maxExperienceYears: props.experienceYears[0] > 0 || props.experienceYears[1] < 20 ? props.experienceYears[1] : null,
          minGraduationYear: props.minGraduationYear,
          maxGraduationYear: props.maxGraduationYear,
          completionStatus: null
        });
        break;
      case 'skill-input':
        props.setSkillInput('');
        break;
      case 'university-input':
        props.setUniversityInput('');
        break;
      case 'company-input':
        props.setCompanyInput('');
        break;
      case 'technology':
        const techToRemove = filter.value;
        props.setTechnologyInput(prev => prev.filter(tech => tech !== techToRemove));
        break;
    }
  };

  return { removeFilter };
};
