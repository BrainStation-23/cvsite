
import { useCallback } from 'react';
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
  setProjectNameInput: (name: string) => void;
  setProjectDescriptionInput: (description: string) => void;
  setTrainingInput: (training: string) => void;
  setAchievementInput: (achievement: string) => void;
  technologyInput: string[];
}

export const useFilterChipsManager = (props: FilterChipsManagerProps) => {
  const removeFilter = useCallback((filterId: string) => {
    console.log('Removing filter:', filterId);
    
    const filter = props.activeFilters.find(f => f.id === filterId);
    if (!filter) return;

    switch (filter.type) {
      case 'search':
        props.onSearch('');
        break;
      
      case 'skill':
      case 'skill-input':
        props.setSkillInput('');
        props.onSkillFilter('');
        break;
      
      case 'experience':
      case 'company-input':
        props.setCompanyInput('');
        props.onExperienceFilter('');
        break;
      
      case 'education':
      case 'university-input':
        props.setUniversityInput('');
        props.onEducationFilter('');
        break;
      
      case 'training':
      case 'training-input':
        props.setTrainingInput('');
        props.onTrainingFilter('');
        break;
      
      case 'achievement':
      case 'achievement-input':
        props.setAchievementInput('');
        props.onAchievementFilter('');
        break;
      
      case 'project':
      case 'project-name-input':
        props.setProjectNameInput('');
        props.onProjectFilter('');
        break;
      
      case 'project-description-input':
        props.setProjectDescriptionInput('');
        props.onProjectFilter('');
        break;
      
      case 'technology':
        const techIndex = parseInt(filterId.split('-')[1]);
        const newTechnologies = [...props.technologyInput];
        newTechnologies.splice(techIndex, 1);
        props.setTechnologyInput(newTechnologies);
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
    }
  }, [props]);

  return { removeFilter };
};
