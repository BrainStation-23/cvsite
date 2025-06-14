
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileTourButton } from '@/components/profile/ProfileTourButton';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { useProfileTour } from '@/hooks/use-profile-tour';
import { Skill } from '@/types';
import Joyride from 'react-joyride';

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [newTechnicalSkill, setNewTechnicalSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1, priority: 0 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1, priority: 0 });
  
  const {
    tourState,
    handleJoyrideCallback,
    startTour,
  } = useProfileTour();

  const {
    isLoading,
    isSaving,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects,
    saveGeneralInfo,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill,
    reorderTechnicalSkills,
    reorderSpecializedSkills,
    saveExperience,
    updateExperience,
    deleteExperience,
    saveEducation,
    updateEducation,
    deleteEducation,
    saveTraining,
    updateTraining,
    deleteTraining,
    saveAchievement,
    updateAchievement,
    deleteAchievement,
    saveProject,
    updateProject,
    deleteProject,
    reorderProjects
  } = useProfile();

  // Updated form to match the GeneralInfoFormData interface
  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName,
      lastName: generalInfo.lastName,
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage,
      currentDesignation: generalInfo.currentDesignation || null
    }
  });

  useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName,
        lastName: generalInfo.lastName,
        biography: generalInfo.biography || '',
        profileImage: generalInfo.profileImage,
        currentDesignation: generalInfo.currentDesignation || null
      });
    }
  }, [isLoading, generalInfo, form.reset]);

  const handleUpdateProfile = async (data: GeneralInfoFormData) => {
    const success = await saveGeneralInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage,
      currentDesignation: data.currentDesignation || null
    });
    return success;
  };

  const handleImageUpdate = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
  };

  const handleAddTechnicalSkill = async () => {
    if (!newTechnicalSkill.name) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      });
      return;
    }

    const success = await saveTechnicalSkill(newTechnicalSkill as Skill);
    if (success) {
      setNewTechnicalSkill({ name: '', proficiency: 1, priority: 0 });
    }
  };

  const handleAddSpecializedSkill = async () => {
    if (!newSpecializedSkill.name) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      });
      return;
    }

    const success = await saveSpecializedSkill(newSpecializedSkill as Skill);
    if (success) {
      setNewSpecializedSkill({ name: '', proficiency: 1, priority: 0 });
    }
  };

  return (
    <DashboardLayout>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={tourState.run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={tourState.steps}
        stepIndex={tourState.stepIndex}
        styles={{
          options: {
            primaryColor: '#0ea5e9',
            textColor: '#374151',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
            beaconSize: 36,
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          buttonNext: {
            backgroundColor: '#0ea5e9',
            borderRadius: 6,
          },
          buttonBack: {
            color: '#6b7280',
          },
          buttonSkip: {
            color: '#6b7280',
          },
        }}
      />
      
      <div className="flex flex-col h-full">
        {/* Header with tour button */}
        <div className="flex-shrink-0 flex justify-between items-center py-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete your professional profile</p>
          </div>
          <ProfileTourButton onStartTour={startTour} />
        </div>

        {/* Content area - now takes full height */}
        <div className="flex-1 min-h-0 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading profile information...</p>
            </div>
          ) : (
            <ProfileTabs
              form={form}
              isEditing={true}
              onImageUpdate={handleImageUpdate}
              technicalSkills={technicalSkills}
              specializedSkills={specializedSkills}
              experiences={experiences}
              education={education}
              trainings={trainings}
              achievements={achievements}
              projects={projects}
              isSaving={isSaving}
              newTechnicalSkill={newTechnicalSkill}
              newSpecializedSkill={newSpecializedSkill}
              setNewTechnicalSkill={setNewTechnicalSkill}
              setNewSpecializedSkill={setNewSpecializedSkill}
              handleAddTechnicalSkill={handleAddTechnicalSkill}
              handleAddSpecializedSkill={handleAddSpecializedSkill}
              saveExperience={saveExperience}
              updateExperience={updateExperience}
              deleteExperience={deleteExperience}
              saveEducation={saveEducation}
              updateEducation={updateEducation}
              deleteEducation={deleteEducation}
              saveTraining={saveTraining}
              updateTraining={updateTraining}
              deleteTraining={deleteTraining}
              saveAchievement={saveAchievement}
              updateAchievement={updateAchievement}
              deleteAchievement={deleteAchievement}
              saveProject={saveProject}
              updateProject={updateProject}
              deleteProject={deleteProject}
              reorderProjects={reorderProjects}
              deleteTechnicalSkill={deleteTechnicalSkill}
              deleteSpecializedSkill={deleteSpecializedSkill}
              saveTechnicalSkill={saveTechnicalSkill}
              saveSpecializedSkill={saveSpecializedSkill}
              reorderTechnicalSkills={reorderTechnicalSkills}
              reorderSpecializedSkills={reorderSpecializedSkills}
              saveGeneralInfo={handleUpdateProfile}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
