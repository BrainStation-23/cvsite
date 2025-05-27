
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { Skill } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1 });
  
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
    deleteProject
  } = useProfile();

  // Create breadcrumbs based on user role
  const breadcrumbs = [
    { label: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Dashboard', href: `/${user?.role}/dashboard` },
    { label: 'My Profile' }
  ];

  // Updated form to match the GeneralInfoFormData interface
  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName,
      lastName: generalInfo.lastName,
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage
    }
  });

  // Update form values when profile data changes
  useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName,
        lastName: generalInfo.lastName,
        biography: generalInfo.biography || '',
        profileImage: generalInfo.profileImage
      });
    }
  }, [isLoading, generalInfo, form.reset]);

  const handleUpdateProfile = async (data: GeneralInfoFormData) => {
    const success = await saveGeneralInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage
    });
    
    if (success) {
      setIsEditing(false);
    }
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
      setNewTechnicalSkill({ name: '', proficiency: 1 });
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
      setNewSpecializedSkill({ name: '', proficiency: 1 });
    }
  };

  return (
    <DashboardLayout title="My Profile" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col h-full">
        {/* Header with action buttons - fixed at top */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end items-center">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  onClick={form.handleSubmit(handleUpdateProfile)}
                  variant="default"
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading profile information...</p>
            </div>
          ) : (
            <ProfileTabs
              form={form}
              isEditing={isEditing}
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
              deleteTechnicalSkill={deleteTechnicalSkill}
              deleteSpecializedSkill={deleteSpecializedSkill}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
