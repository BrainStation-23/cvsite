
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTabsContent } from './tabs/ProfileTabsContent';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from './generalInfo/GeneralInfoTab';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

interface ProfileTabsProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
  onImageUpdate: (imageUrl: string | null) => void;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  trainings: Training[];
  achievements: Achievement[];
  projects: Project[];
  isSaving: boolean;
  newTechnicalSkill: Omit<Skill, 'id'>;
  newSpecializedSkill: Omit<Skill, 'id'>;
  setNewTechnicalSkill: (skill: Omit<Skill, 'id'>) => void;
  setNewSpecializedSkill: (skill: Omit<Skill, 'id'>) => void;
  handleAddTechnicalSkill: () => void;
  handleAddSpecializedSkill: () => void;
  saveExperience: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  updateExperience: (id: string, experience: Partial<Experience>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  saveEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  updateEducation: (id: string, education: Partial<Education>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  saveTraining: (training: Omit<Training, 'id'>) => Promise<boolean>;
  updateTraining: (id: string, training: Partial<Training>) => Promise<boolean>;
  deleteTraining: (id: string) => Promise<boolean>;
  saveAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  saveProject: (project: Omit<Project, 'id'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projects: Project[]) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
  reorderSpecializedSkills: (skills: Skill[]) => Promise<boolean>;
  profileId?: string;
  saveGeneralInfo: (data: GeneralInfoFormData) => Promise<boolean>;
  onDataChange?: () => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = (props) => {
  const profileData = {
    generalInfo: {
      firstName: props.form.getValues('firstName'),
      lastName: props.form.getValues('lastName'),
      biography: props.form.getValues('biography'),
      profileImage: props.form.getValues('profileImage'),
      currentDesignation: props.form.getValues('currentDesignation'),
    },
    technicalSkills: props.technicalSkills,
    specializedSkills: props.specializedSkills,
    experiences: props.experiences,
    education: props.education,
    trainings: props.trainings,
    achievements: props.achievements,
    projects: props.projects,
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="cv-import">AI Import</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <ProfileTabsContent
          {...props}
          profileData={profileData}
          handleGeneralInfoSave={props.saveGeneralInfo}
          importProfile={async () => {}} // This will be handled by CVImportTab
        />
      </Tabs>
    </div>
  );
};
