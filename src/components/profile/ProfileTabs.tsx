
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ProfileTabsList } from './tabs/ProfileTabsList';
import { ProfileTabsContent } from './tabs/ProfileTabsContent';
import { GamificationHeader } from '@/components/ui/gamification-header';
import { useForm, UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from './GeneralInfoTab';
import { useProfileGeneralInfo } from '@/hooks/profile/use-profile-general-info';
import { useProfileSkills } from '@/hooks/profile/use-profile-skills';
import { useProfileExperience } from '@/hooks/profile/use-profile-experience';
import { useProfileEducation } from '@/hooks/profile/use-profile-education';
import { useProfileTraining } from '@/hooks/profile/use-profile-training';
import { useProfileAchievements } from '@/hooks/profile/use-profile-achievements';
import { useProfileProjects } from '@/hooks/profile/use-profile-projects';
import { useProfileGamification } from '@/hooks/profile/use-profile-gamification';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

// New interface for when ProfileTabs is used standalone (like in ViewProfilePage)
interface ProfileTabsStandaloneProps {
  profileId?: string;
}

// Interface for when ProfileTabs is used with external data (like in ProfilePage)
interface ProfileTabsWithDataProps {
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
}

export type ProfileTabsProps = ProfileTabsStandaloneProps | ProfileTabsWithDataProps;

// Type guard to check if props include external data
function isProfileTabsWithDataProps(props: ProfileTabsProps): props is ProfileTabsWithDataProps {
  return 'form' in props;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('general');

  // If external data is provided, use it; otherwise fetch it internally
  if (isProfileTabsWithDataProps(props)) {
    // External data mode (ProfilePage)
    const {
      form,
      isEditing,
      onImageUpdate,
      technicalSkills,
      specializedSkills,
      experiences,
      education,
      trainings,
      achievements,
      projects,
      profileId,
      ...otherProps
    } = props;

    // Get general info from form
    const generalInfo = {
      firstName: form.getValues('firstName'),
      lastName: form.getValues('lastName'),
      biography: form.getValues('biography'),
      profileImage: form.getValues('profileImage'),
      currentDesignation: form.getValues('currentDesignation')
    };

    // Get gamification stats
    const gamificationStats = useProfileGamification({
      generalInfo,
      technicalSkills,
      specializedSkills,
      experiences,
      education,
      trainings,
      achievements,
      projects
    });

    return (
      <div className="space-y-6">
        {/* Gamification Header */}
        <GamificationHeader
          profileCompletion={gamificationStats.profileCompletion}
          currentXP={gamificationStats.currentXP}
          currentLevel={gamificationStats.currentLevel}
          xpForNextLevel={gamificationStats.xpForNextLevel}
          xpToNextLevel={gamificationStats.xpToNextLevel}
        />

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ProfileTabsList
            form={form}
            technicalSkills={technicalSkills}
            specializedSkills={specializedSkills}
            experiences={experiences}
            education={education}
            trainings={trainings}
            achievements={achievements}
            projects={projects}
          />
          
          <ProfileTabsContent 
            {...props}
            handleGeneralInfoSave={props.saveGeneralInfo}
            profileData={{
              generalInfo,
              technicalSkills,
              specializedSkills,
              experiences,
              education,
              trainings,
              achievements,
              projects
            }}
            importProfile={async () => false} // Placeholder - needs implementation
          />
        </Tabs>
      </div>
    );
  } else {
    // Internal data fetching mode (ViewProfilePage)
    const { profileId } = props;

    // Initialize all profile data hooks
    const { generalInfo } = useProfileGeneralInfo(profileId);
    const { technicalSkills, specializedSkills } = useProfileSkills(profileId);
    const { experiences } = useProfileExperience(profileId);
    const { education } = useProfileEducation(profileId);
    const { trainings } = useProfileTraining(profileId);
    const { achievements } = useProfileAchievements(profileId);
    const { projects } = useProfileProjects(profileId);

    // Initialize form with general info
    const form = useForm<GeneralInfoFormData>({
      defaultValues: {
        firstName: generalInfo?.firstName || '',
        lastName: generalInfo?.lastName || '',
        biography: generalInfo?.biography || '',
        profileImage: generalInfo?.profileImage || '',
        currentDesignation: generalInfo?.currentDesignation || ''
      }
    });

    // Get gamification stats
    const gamificationStats = useProfileGamification({
      generalInfo,
      technicalSkills,
      specializedSkills,
      experiences,
      education,
      trainings,
      achievements,
      projects
    });

    return (
      <div className="space-y-6">
        {/* Gamification Header */}
        <GamificationHeader
          profileCompletion={gamificationStats.profileCompletion}
          currentXP={gamificationStats.currentXP}
          currentLevel={gamificationStats.currentLevel}
          xpForNextLevel={gamificationStats.xpForNextLevel}
          xpToNextLevel={gamificationStats.xpToNextLevel}
        />

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ProfileTabsList
            form={form}
            technicalSkills={technicalSkills}
            specializedSkills={specializedSkills}
            experiences={experiences}
            education={education}
            trainings={trainings}
            achievements={achievements}
            projects={projects}
          />
          
          <ProfileTabsContent profileId={profileId} />
        </Tabs>
      </div>
    );
  }
};
