import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

export function useEmployeeProfileEditor(profileId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Check if current user can edit (admin or manager)
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  // Save general info for employee
  const saveGeneralInfo = async (data: {
    firstName: string;
    lastName: string;
    biography: string | null;
  }) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingData) {
        const { error } = await supabase
          .from('general_information')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', profileId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('general_information')
          .insert({
            profile_id: profileId,
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography
          });
        
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Profile information has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile information',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Technical skills functions
  const handleAddTechnicalSkill = async (skill: Omit<Skill, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      // Get the highest priority to add the new skill at the end
      const { data: existingSkills } = await supabase
        .from('technical_skills')
        .select('priority')
        .eq('profile_id', profileId)
        .order('priority', { ascending: false })
        .limit(1);
      
      const maxPriority = existingSkills && existingSkills.length > 0 ? existingSkills[0].priority : 0;
      
      const { error } = await supabase
        .from('technical_skills')
        .insert({
          profile_id: profileId,
          name: skill.name,
          proficiency: skill.proficiency,
          priority: maxPriority + 1
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Technical skill has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error adding technical skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to add technical skill',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteTechnicalSkill = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('technical_skills')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Technical skill has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting technical skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove technical skill',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Specialized skills functions
  const handleAddSpecializedSkill = async (skill: Omit<Skill, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      // Get the highest priority to add the new skill at the end
      const { data: existingSkills } = await supabase
        .from('specialized_skills')
        .select('priority')
        .eq('profile_id', profileId)
        .order('priority', { ascending: false })
        .limit(1);
      
      const maxPriority = existingSkills && existingSkills.length > 0 ? existingSkills[0].priority : 0;
      
      const { error } = await supabase
        .from('specialized_skills')
        .insert({
          profile_id: profileId,
          name: skill.name,
          proficiency: skill.proficiency,
          priority: maxPriority + 1
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Specialized skill has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error adding specialized skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to add specialized skill',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteSpecializedSkill = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('specialized_skills')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Specialized skill has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting specialized skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove specialized skill',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Experience functions
  const saveExperience = async (experience: Omit<Experience, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('experiences')
        .insert({
          profile_id: profileId,
          company_name: experience.companyName,
          designation: experience.designation,
          description: experience.description,
          start_date: experience.startDate.toISOString().split('T')[0],
          end_date: experience.endDate ? experience.endDate.toISOString().split('T')[0] : null,
          is_current: experience.isCurrent
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Experience has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to add experience',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateExperience = async (id: string, experience: Partial<Experience>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (experience.companyName) updateData.company_name = experience.companyName;
      if (experience.designation !== undefined) updateData.designation = experience.designation;
      if (experience.description !== undefined) updateData.description = experience.description;
      if (experience.startDate) updateData.start_date = experience.startDate.toISOString().split('T')[0];
      if (experience.endDate !== undefined) updateData.end_date = experience.endDate ? experience.endDate.toISOString().split('T')[0] : null;
      if (experience.isCurrent !== undefined) updateData.is_current = experience.isCurrent;
      
      const { error } = await supabase
        .from('experiences')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Experience has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to update experience',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExperience = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Experience has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove experience',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Education functions - simplified for brevity, following same pattern
  const saveEducation = async (education: Omit<Education, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('education')
        .insert({
          profile_id: profileId,
          university: education.university,
          degree: education.degree,
          department: education.department,
          gpa: education.gpa,
          start_date: education.startDate.toISOString().split('T')[0],
          end_date: education.endDate ? education.endDate.toISOString().split('T')[0] : null,
          is_current: education.isCurrent
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Education has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: 'Error',
        description: 'Failed to add education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEducation = async (id: string, education: Partial<Education>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (education.university) updateData.university = education.university;
      if (education.degree !== undefined) updateData.degree = education.degree;
      if (education.department !== undefined) updateData.department = education.department;
      if (education.gpa !== undefined) updateData.gpa = education.gpa;
      if (education.startDate) updateData.start_date = education.startDate.toISOString().split('T')[0];
      if (education.endDate !== undefined) updateData.end_date = education.endDate ? education.endDate.toISOString().split('T')[0] : null;
      if (education.isCurrent !== undefined) updateData.is_current = education.isCurrent;
      
      const { error } = await supabase
        .from('education')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Education has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating education:', error);
      toast({
        title: 'Error',
        description: 'Failed to update education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEducation = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Education has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove education',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Training, Achievement, and Project functions follow the same pattern
  const saveTraining = async (training: Omit<Training, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('trainings')
        .insert({
          profile_id: profileId,
          title: training.title,
          provider: training.provider,
          description: training.description,
          certification_date: training.date.toISOString().split('T')[0],
          certificate_url: training.certificateUrl
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Training has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving training:', error);
      toast({
        title: 'Error',
        description: 'Failed to add training',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateTraining = async (id: string, training: Partial<Training>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (training.title) updateData.title = training.title;
      if (training.provider) updateData.provider = training.provider;
      if (training.description !== undefined) updateData.description = training.description;
      if (training.date) updateData.certification_date = training.date.toISOString().split('T')[0];
      if (training.certificateUrl !== undefined) updateData.certificate_url = training.certificateUrl;
      
      const { error } = await supabase
        .from('trainings')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Training has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating training:', error);
      toast({
        title: 'Error',
        description: 'Failed to update training',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTraining = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Training has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting training:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove training',
        variant: 'destructive'
      });
      return false;
    }
  };

  const saveAchievement = async (achievement: Omit<Achievement, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('achievements')
        .insert({
          profile_id: profileId,
          title: achievement.title,
          description: achievement.description,
          date: achievement.date.toISOString().split('T')[0]
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Achievement has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to add achievement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAchievement = async (id: string, achievement: Partial<Achievement>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (achievement.title) updateData.title = achievement.title;
      if (achievement.description !== undefined) updateData.description = achievement.description;
      if (achievement.date) updateData.date = achievement.date.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Achievement has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update achievement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAchievement = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Achievement has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove achievement',
        variant: 'destructive'
      });
      return false;
    }
  };

  const saveProject = async (project: Omit<Project, 'id'>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('projects')
        .insert({
          profile_id: profileId,
          name: project.name,
          role: project.role,
          description: project.description,
          start_date: project.startDate.toISOString().split('T')[0],
          end_date: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
          is_current: project.isCurrent,
          technologies_used: project.technologiesUsed,
          url: project.url
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Project has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!canEdit || !profileId) return false;
    
    try {
      setIsSaving(true);
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (project.name) updateData.name = project.name;
      if (project.role) updateData.role = project.role;
      if (project.description !== undefined) updateData.description = project.description;
      if (project.startDate) updateData.start_date = project.startDate.toISOString().split('T')[0];
      if (project.endDate !== undefined) updateData.end_date = project.endDate ? project.endDate.toISOString().split('T')[0] : null;
      if (project.isCurrent !== undefined) updateData.is_current = project.isCurrent;
      if (project.technologiesUsed !== undefined) updateData.technologies_used = project.technologiesUsed;
      if (project.url !== undefined) updateData.url = project.url;
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Project has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!canEdit || !profileId) return false;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('profile_id', profileId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Project has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove project',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
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
  };
}
