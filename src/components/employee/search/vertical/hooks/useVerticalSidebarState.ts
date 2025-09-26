
import { useState } from 'react';

export function useVerticalSidebarState() {
  const [experienceYears, setExperienceYears] = useState<number[]>([0, 20]);
  const [minGraduationYear, setMinGraduationYear] = useState<number | null>(null);
  const [maxGraduationYear, setMaxGraduationYear] = useState<number | null>(null);
  const [completionStatus, setCompletionStatus] = useState<string>('all');
  
  const [skillInput, setSkillInput] = useState('');
  const [universityInput, setUniversityInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState<string[]>([]);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [projectDescriptionInput, setProjectDescriptionInput] = useState('');
  const [trainingInput, setTrainingInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const [highlightedFilters, setHighlightedFilters] = useState<string[]>([]);

  return {
    experienceYears,
    setExperienceYears,
    minGraduationYear,
    setMinGraduationYear,
    maxGraduationYear,
    setMaxGraduationYear,
    completionStatus,
    setCompletionStatus,
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
    highlightedFilters,
    setHighlightedFilters,
  };
}
