
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { useEmployeeProfile } from '@/hooks/use-employee-profile';
import { useEmployeeProfileEditor } from '@/hooks/use-employee-profile-editor';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { useForm } from 'react-hook-form';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { useAuth } from '@/contexts/AuthContext';

const ViewProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState({ name: '', proficiency: 1 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState({ name: '', proficiency: 1 });
  
  const {
    isLoading,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  } = useEmployeeProfile(profileId || '');

  const {
    canEdit,
    isSaving,
    saveGeneralInfo,
    handleAddTechnicalSkill,
    deleteTechnicalSkill,
    handleAddSpecializedSkill,
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
  } = useEmployeeProfileEditor(profileId || '');

  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName || '',
      lastName: generalInfo.lastName || '',
      biography: generalInfo.biography || ''
    }
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName || '',
        lastName: generalInfo.lastName || '',
        biography: generalInfo.biography || ''
      });
    }
  }, [isLoading, generalInfo, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const formData = form.getValues();
    const success = await saveGeneralInfo({
      firstName: formData.firstName,
      lastName: formData.lastName,
      biography: formData.biography
    });
    
    if (success) {
      setIsEditing(false);
      // Optionally refresh the data here
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    form.reset({
      firstName: generalInfo.firstName || '',
      lastName: generalInfo.lastName || '',
      biography: generalInfo.biography || ''
    });
  };

  const handleAddTechnicalSkillWrapper = async () => {
    if (newTechnicalSkill.name.trim()) {
      const success = await handleAddTechnicalSkill(newTechnicalSkill);
      if (success) {
        setNewTechnicalSkill({ name: '', proficiency: 1 });
        // Optionally refresh the data here
        window.location.reload();
      }
    }
    return false;
  };

  const handleAddSpecializedSkillWrapper = async () => {
    if (newSpecializedSkill.name.trim()) {
      const success = await handleAddSpecializedSkill(newSpecializedSkill);
      if (success) {
        setNewSpecializedSkill({ name: '', proficiency: 1 });
        // Optionally refresh the data here
        window.location.reload();
      }
    }
    return false;
  };

  const handleDeleteTechnicalSkill = async (id: string) => {
    const success = await deleteTechnicalSkill(id);
    if (success) {
      // Optionally refresh the data here
      window.location.reload();
    }
    return success;
  };

  const handleDeleteSpecializedSkill = async (id: string) => {
    const success = await deleteSpecializedSkill(id);
    if (success) {
      // Optionally refresh the data here
      window.location.reload();
    }
    return success;
  };

  // Wrapper functions for other operations that refresh data
  const saveExperienceWrapper = async (experience: any) => {
    const success = await saveExperience(experience);
    if (success) window.location.reload();
    return success;
  };

  const updateExperienceWrapper = async (id: string, experience: any) => {
    const success = await updateExperience(id, experience);
    if (success) window.location.reload();
    return success;
  };

  const deleteExperienceWrapper = async (id: string) => {
    const success = await deleteExperience(id);
    if (success) window.location.reload();
    return success;
  };

  const saveEducationWrapper = async (education: any) => {
    const success = await saveEducation(education);
    if (success) window.location.reload();
    return success;
  };

  const updateEducationWrapper = async (id: string, education: any) => {
    const success = await updateEducation(id, education);
    if (success) window.location.reload();
    return success;
  };

  const deleteEducationWrapper = async (id: string) => {
    const success = await deleteEducation(id);
    if (success) window.location.reload();
    return success;
  };

  const saveTrainingWrapper = async (training: any) => {
    const success = await saveTraining(training);
    if (success) window.location.reload();
    return success;
  };

  const updateTrainingWrapper = async (id: string, training: any) => {
    const success = await updateTraining(id, training);
    if (success) window.location.reload();
    return success;
  };

  const deleteTrainingWrapper = async (id: string) => {
    const success = await deleteTraining(id);
    if (success) window.location.reload();
    return success;
  };

  const saveAchievementWrapper = async (achievement: any) => {
    const success = await saveAchievement(achievement);
    if (success) window.location.reload();
    return success;
  };

  const updateAchievementWrapper = async (id: string, achievement: any) => {
    const success = await updateAchievement(id, achievement);
    if (success) window.location.reload();
    return success;
  };

  const deleteAchievementWrapper = async (id: string) => {
    const success = await deleteAchievement(id);
    if (success) window.location.reload();
    return success;
  };

  const saveProjectWrapper = async (project: any) => {
    const success = await saveProject(project);
    if (success) window.location.reload();
    return success;
  };

  const updateProjectWrapper = async (id: string, project: any) => {
    const success = await updateProject(id, project);
    if (success) window.location.reload();
    return success;
  };

  const deleteProjectWrapper = async (id: string) => {
    const success = await deleteProject(id);
    if (success) window.location.reload();
    return success;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading profile information...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/employee-data')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Employee Data
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">
                {generalInfo.firstName} {generalInfo.lastName}'s Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Employee profile details
              </p>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <ProfileTabs
          form={form}
          isEditing={isEditing}
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
          handleAddTechnicalSkill={handleAddTechnicalSkillWrapper}
          handleAddSpecializedSkill={handleAddSpecializedSkillWrapper}
          saveExperience={saveExperienceWrapper}
          updateExperience={updateExperienceWrapper}
          deleteExperience={deleteExperienceWrapper}
          saveEducation={saveEducationWrapper}
          updateEducation={updateEducationWrapper}
          deleteEducation={deleteEducationWrapper}
          saveTraining={saveTrainingWrapper}
          updateTraining={updateTrainingWrapper}
          deleteTraining={deleteTrainingWrapper}
          saveAchievement={saveAchievementWrapper}
          updateAchievement={updateAchievementWrapper}
          deleteAchievement={deleteAchievementWrapper}
          saveProject={saveProjectWrapper}
          updateProject={updateProjectWrapper}
          deleteProject={deleteProjectWrapper}
          deleteTechnicalSkill={handleDeleteTechnicalSkill}
          deleteSpecializedSkill={handleDeleteSpecializedSkill}
        />
      </div>
    </DashboardLayout>
  );
};

export default ViewProfilePage;
