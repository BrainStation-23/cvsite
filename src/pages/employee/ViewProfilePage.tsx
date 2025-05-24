import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { useForm } from 'react-hook-form';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { useAuth } from '@/contexts/AuthContext';
import { useGeneralInfo } from '@/hooks/profile/use-general-info';
import { useSkills } from '@/hooks/profile/use-skills';
import { useExperience } from '@/hooks/profile/use-experience';
import { useEducation } from '@/hooks/profile/use-education';
import { useTraining } from '@/hooks/profile/use-training';
import { useAchievements } from '@/hooks/profile/use-achievements';
import { useProjects } from '@/hooks/profile/use-projects';

const ViewProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState({ name: '', proficiency: 1 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState({ name: '', proficiency: 1 });
  
  // Use the updated hooks with profileId
  const { isLoading: generalInfoLoading, generalInfo, saveGeneralInfo, isSaving: generalInfoSaving } = useGeneralInfo(profileId);
  const { isLoading: skillsLoading, technicalSkills, specializedSkills, saveTechnicalSkill, saveSpecializedSkill, deleteTechnicalSkill, deleteSpecializedSkill, isSaving: skillsSaving } = useSkills(profileId);
  const { experiences, saveExperience, updateExperience, deleteExperience, isLoading: experienceLoading, isSaving: experienceSaving } = useExperience(profileId);
  const { education, saveEducation, updateEducation, deleteEducation, isLoading: educationLoading, isSaving: educationSaving } = useEducation(profileId);
  const { trainings, saveTraining, updateTraining, deleteTraining, isLoading: trainingLoading, isSaving: trainingSaving } = useTraining(profileId);
  const { achievements, saveAchievement, updateAchievement, deleteAchievement, isLoading: achievementsLoading, isSaving: achievementsSaving } = useAchievements(profileId);
  const { projects, saveProject, updateProject, deleteProject, isLoading: projectsLoading, isSaving: projectsSaving } = useProjects(profileId);

  // Check if current user can edit (admin or manager)
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const isLoading = generalInfoLoading || skillsLoading || experienceLoading || educationLoading || trainingLoading || achievementsLoading || projectsLoading;
  const isSaving = generalInfoSaving || skillsSaving || experienceSaving || educationSaving || trainingSaving || achievementsSaving || projectsSaving;

  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName || '',
      lastName: generalInfo.lastName || '',
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage
    }
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName || '',
        lastName: generalInfo.lastName || '',
        biography: generalInfo.biography || '',
        profileImage: generalInfo.profileImage
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
      biography: formData.biography,
      profileImage: formData.profileImage
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    form.reset({
      firstName: generalInfo.firstName || '',
      lastName: generalInfo.lastName || '',
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage
    });
  };

  const handleImageUpdate = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
  };

  const handleAddTechnicalSkillWrapper = async () => {
    if (newTechnicalSkill.name.trim()) {
      const success = await saveTechnicalSkill({ ...newTechnicalSkill, id: '' });
      if (success) {
        setNewTechnicalSkill({ name: '', proficiency: 1 });
      }
    }
    return false;
  };

  const handleAddSpecializedSkillWrapper = async () => {
    if (newSpecializedSkill.name.trim()) {
      const success = await saveSpecializedSkill({ ...newSpecializedSkill, id: '' });
      if (success) {
        setNewSpecializedSkill({ name: '', proficiency: 1 });
      }
    }
    return false;
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
          profileId={profileId}
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
          handleAddTechnicalSkill={handleAddTechnicalSkillWrapper}
          handleAddSpecializedSkill={handleAddSpecializedSkillWrapper}
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
      </div>
    </DashboardLayout>
  );
};

export default ViewProfilePage;
