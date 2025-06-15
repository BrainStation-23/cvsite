
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ProfileTabsList } from './tabs/ProfileTabsList';
import { ProfileTabsContent } from './tabs/ProfileTabsContent';
import { GamificationHeader } from '@/components/ui/gamification-header';
import { useForm } from 'react-hook-form';
import { GeneralInfoFormData } from './GeneralInfoTab';
import { useProfileGeneralInfo } from '@/hooks/profile/use-profile-general-info';
import { useProfileSkills } from '@/hooks/profile/use-profile-skills';
import { useProfileExperience } from '@/hooks/profile/use-profile-experience';
import { useProfileEducation } from '@/hooks/profile/use-profile-education';
import { useProfileTraining } from '@/hooks/profile/use-profile-training';
import { useProfileAchievements } from '@/hooks/profile/use-profile-achievements';
import { useProfileProjects } from '@/hooks/profile/use-profile-projects';
import { useProfileGamification } from '@/hooks/profile/use-profile-gamification';

interface ProfileTabsProps {
  profileId?: string;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ profileId }) => {
  const [activeTab, setActiveTab] = useState('general');

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
};
