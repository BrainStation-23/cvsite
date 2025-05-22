
import { useState } from 'react';
import { useGeneralInfo } from './use-general-info';
import { useSkills } from './use-skills';
import { useExperience } from './use-experience';
import { useEducation } from './use-education';
import { Training, Achievement, Project } from '@/types';

export { useGeneralInfo } from './use-general-info';
export { useSkills } from './use-skills';
export { useExperience } from './use-experience';
export { useEducation } from './use-education';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  designation: string;
  biography: string;
  technicalSkills: {
    name: string;
    proficiency: number;
  }[];
  specializedSkills: {
    name: string;
    proficiency: number;
  }[];
}

export function useProfile() {
  const generalInfoHook = useGeneralInfo();
  const skillsHook = useSkills();
  const experienceHook = useExperience();
  const educationHook = useEducation();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const isLoading = generalInfoHook.isLoading || 
                   skillsHook.isLoading || 
                   experienceHook.isLoading || 
                   educationHook.isLoading;
  
  const isSaving = generalInfoHook.isSaving || 
                   skillsHook.isSaving || 
                   experienceHook.isSaving || 
                   educationHook.isSaving;

  return {
    // State
    isLoading,
    isSaving,
    generalInfo: generalInfoHook.generalInfo,
    technicalSkills: skillsHook.technicalSkills,
    specializedSkills: skillsHook.specializedSkills,
    experiences: experienceHook.experiences,
    education: educationHook.education,
    trainings,
    achievements,
    projects,
    
    // Methods
    saveGeneralInfo: generalInfoHook.saveGeneralInfo,
    saveTechnicalSkill: skillsHook.saveTechnicalSkill,
    saveSpecializedSkill: skillsHook.saveSpecializedSkill,
    deleteTechnicalSkill: skillsHook.deleteTechnicalSkill,
    deleteSpecializedSkill: skillsHook.deleteSpecializedSkill,
    saveExperience: experienceHook.saveExperience,
    updateExperience: experienceHook.updateExperience,
    deleteExperience: experienceHook.deleteExperience,
    saveEducation: educationHook.saveEducation,
    updateEducation: educationHook.updateEducation,
    deleteEducation: educationHook.deleteEducation
  };
}
