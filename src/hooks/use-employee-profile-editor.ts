import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Profile, Education, Experience, Project, Achievement, Training } from '@/types';

interface UseEmployeeProfileEditorProps {
  profileId: string;
}

interface UpdateProfileParams {
  id: string;
  updates: Partial<Profile>;
}

export const useEmployeeProfileEditor = (profileId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: education, isLoading: isEducationLoading } = useQuery({
    queryKey: ['education', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: experience, isLoading: isExperienceLoading } = useQuery({
    queryKey: ['experience', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: achievements, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ['achievements', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: training, isLoading: isTrainingLoading } = useQuery({
    queryKey: ['training', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, updates }: UpdateProfileParams) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      console.error('Error updating profile:', error);
    }
  });

  const saveEducationMutation = useMutation({
    mutationFn: async (data: Omit<Education, 'id'>) => {
      const startDate = typeof data.startDate === 'string' ? data.startDate : new Date(data.startDate).toISOString().split('T')[0];
      const endDate = data.endDate 
        ? (typeof data.endDate === 'string' ? data.endDate : new Date(data.endDate).toISOString().split('T')[0])
        : null;

      const { error } = await supabase
        .from('education')
        .insert({
          profile_id: profileId,
          university: data.university,
          degree: data.degree,
          department: data.department,
          gpa: data.gpa,
          start_date: startDate,
          end_date: endDate,
          is_current: data.isCurrent
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({ title: 'Success', description: 'Education saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save education.', variant: 'destructive' });
      console.error('Error saving education:', error);
    }
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Education> }) => {
      const updateData: any = { ...data };
      
      if (data.startDate) {
        updateData.start_date = typeof data.startDate === 'string' ? data.startDate : new Date(data.startDate).toISOString().split('T')[0];
        delete updateData.startDate;
      }
      if (data.endDate !== undefined) {
        updateData.end_date = data.endDate 
          ? (typeof data.endDate === 'string' ? data.endDate : new Date(data.endDate).toISOString().split('T')[0])
          : null;
        delete updateData.endDate;
      }
      if (data.isCurrent !== undefined) {
        updateData.is_current = data.isCurrent;
        delete updateData.isCurrent;
      }

      const { error } = await supabase
        .from('education')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({ title: 'Success', description: 'Education updated successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update education.', variant: 'destructive' });
      console.error('Error updating education:', error);
    }
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', profileId] });
      toast({ title: 'Success', description: 'Education deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete education.', variant: 'destructive' });
      console.error('Error deleting education:', error);
    }
  });

  const saveExperienceMutation = useMutation({
    mutationFn: async (data: Omit<Experience, 'id'>) => {
      const startDate = typeof data.startDate === 'string' ? data.startDate : new Date(data.startDate).toISOString().split('T')[0];
      const endDate = data.endDate 
        ? (typeof data.endDate === 'string' ? data.endDate : new Date(data.endDate).toISOString().split('T')[0])
        : null;

      const { error } = await supabase
        .from('experience')
        .insert({
          profile_id: profileId,
          company_name: data.companyName,
          designation: data.designation,
          description: data.description,
          start_date: startDate,
          end_date: endDate,
          is_current: data.isCurrent
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({ title: 'Success', description: 'Experience saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save experience.', variant: 'destructive' });
      console.error('Error saving experience:', error);
    }
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Experience> }) => {
      const updateData: any = { ...data };
      
      if (data.startDate) {
        updateData.start_date = typeof data.startDate === 'string' ? data.startDate : new Date(data.startDate).toISOString().split('T')[0];
        delete updateData.startDate;
      }
      if (data.endDate !== undefined) {
        updateData.end_date = data.endDate 
          ? (typeof data.endDate === 'string' ? data.endDate : new Date(data.endDate).toISOString().split('T')[0])
          : null;
        delete updateData.endDate;
      }
      if (data.isCurrent !== undefined) {
        updateData.is_current = data.isCurrent;
        delete updateData.isCurrent;
      }
      if (data.companyName !== undefined) {
        updateData.company_name = data.companyName;
        delete updateData.companyName;
      }

      const { error } = await supabase
        .from('experience')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({ title: 'Success', description: 'Experience updated successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update experience.', variant: 'destructive' });
      console.error('Error updating experience:', error);
    }
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', profileId] });
      toast({ title: 'Success', description: 'Experience deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete experience.', variant: 'destructive' });
      console.error('Error deleting experience:', error);
    }
  });

  const saveProjectMutation = useMutation({
    mutationFn: async (data: Omit<Project, 'id'>) => {
      const startDate = typeof data.startDate === 'string' ? data.startDate : new Date(data.startDate).toISOString().split('T')[0];
      const endDate = data.endDate 
        ? (typeof data.endDate === 'string' ? data.endDate : new Date(data.endDate).toISOString().split('T')[0])
        : null;

      const { error } = await supabase
        .from('projects')
        .insert({
          profile_id: profileId,
          name: data.name,
          role: data.role,
          description: data.description,
          responsibility: data.responsibility,
          start_date: startDate,
          end_date: endDate,
          is_current: data.isCurrent,
          technologies_used: data.technologiesUsed,
          url: data.url
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
      toast({ title: 'Success', description: 'Project saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save project.', variant: 'destructive' });
      console.error('Error saving project:', error);
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const updateData: any = { ...data };
      
      if (data.startDate) {
        updateData.start_date = typeof data.startDate === 'string' ? data.startDate : new Date(data.startDate).toISOString().split('T')[0];
        delete updateData.startDate;
      }
      if (data.endDate !== undefined) {
        updateData.end_date = data.endDate 
          ? (typeof data.endDate === 'string' ? data.endDate : new Date(data.endDate).toISOString().split('T')[0])
          : null;
        delete updateData.endDate;
      }
      if (data.isCurrent !== undefined) {
        updateData.is_current = data.isCurrent;
        delete updateData.isCurrent;
      }
      if (data.technologiesUsed !== undefined) {
        updateData.technologies_used = data.technologiesUsed;
        delete updateData.technologiesUsed;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
      toast({ title: 'Success', description: 'Project updated successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update project.', variant: 'destructive' });
      console.error('Error updating project:', error);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', profileId] });
      toast({ title: 'Success', description: 'Project deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete project.', variant: 'destructive' });
      console.error('Error deleting project:', error);
    }
  });

  const saveAchievementMutation = useMutation({
    mutationFn: async (data: Omit<Achievement, 'id'>) => {
      const date = typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0];

      const { error } = await supabase
        .from('achievements')
        .insert({
          profile_id: profileId,
          title: data.title,
          description: data.description,
          date: date
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({ title: 'Success', description: 'Achievement saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save achievement.', variant: 'destructive' });
      console.error('Error saving achievement:', error);
    }
  });

  const updateAchievementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Achievement> }) => {
      const updateData: any = { ...data };
      
      if (data.date) {
        updateData.date = typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({ title: 'Success', description: 'Achievement updated successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update achievement.', variant: 'destructive' });
      console.error('Error updating achievement:', error);
    }
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements', profileId] });
      toast({ title: 'Success', description: 'Achievement deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete achievement.', variant: 'destructive' });
      console.error('Error deleting achievement:', error);
    }
  });

  const saveTrainingMutation = useMutation({
    mutationFn: async (data: Omit<Training, 'id'>) => {
      const date = typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0];
      const expiryDate = data.expiryDate 
        ? (typeof data.expiryDate === 'string' ? data.expiryDate : new Date(data.expiryDate).toISOString().split('T')[0])
        : null;

      const { error } = await supabase
        .from('training')
        .insert({
          profile_id: profileId,
          title: data.title,
          provider: data.provider,
          description: data.description,
          date: date,
          certificate_url: data.certificateUrl,
          is_renewable: data.isRenewable,
          expiry_date: expiryDate
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', profileId] });
      toast({ title: 'Success', description: 'Training saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save training.', variant: 'destructive' });
      console.error('Error saving training:', error);
    }
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Training> }) => {
      const updateData: any = { ...data };
      
      if (data.date) {
        updateData.date = typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0];
      }
      if (data.expiryDate !== undefined) {
        updateData.expiry_date = data.expiryDate 
          ? (typeof data.expiryDate === 'string' ? data.expiryDate : new Date(data.expiryDate).toISOString().split('T')[0])
          : null;
        delete updateData.expiryDate;
      }
      if (data.certificateUrl !== undefined) {
        updateData.certificate_url = data.certificateUrl;
        delete updateData.certificateUrl;
      }
      if (data.isRenewable !== undefined) {
        updateData.is_renewable = data.isRenewable;
        delete updateData.isRenewable;
      }

      const { error } = await supabase
        .from('training')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', profileId] });
      toast({ title: 'Success', description: 'Training updated successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update training.', variant: 'destructive' });
      console.error('Error updating training:', error);
    }
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', profileId] });
      toast({ title: 'Success', description: 'Training deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete training.', variant: 'destructive' });
      console.error('Error deleting training:', error);
    }
  });

  return {
    profile,
    isProfileLoading,
    education,
    isEducationLoading,
    experience,
    isExperienceLoading,
    projects,
    isProjectsLoading,
    achievements,
    isAchievementsLoading,
    training,
    isTrainingLoading,
    isEditing,
    setIsEditing,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isLoading,
    saveEducation: saveEducationMutation.mutateAsync,
    isSavingEducation: saveEducationMutation.isLoading,
    updateEducation: updateEducationMutation.mutateAsync,
    isUpdatingEducation: updateEducationMutation.isLoading,
    deleteEducation: deleteEducationMutation.mutateAsync,
    isDeletingEducation: deleteEducationMutation.isLoading,
    saveExperience: saveExperienceMutation.mutateAsync,
    isSavingExperience: saveExperienceMutation.isLoading,
    updateExperience: updateExperienceMutation.mutateAsync,
    isUpdatingExperience: updateExperienceMutation.isLoading,
    deleteExperience: deleteExperienceMutation.mutateAsync,
    isDeletingExperience: deleteExperienceMutation.isLoading,
    saveProject: saveProjectMutation.mutateAsync,
    isSavingProject: saveProjectMutation.isLoading,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdatingProject: updateProjectMutation.isLoading,
    deleteProject: deleteProjectMutation.mutateAsync,
    isDeletingProject: deleteProjectMutation.isLoading,
    saveAchievement: saveAchievementMutation.mutateAsync,
    isSavingAchievement: saveAchievementMutation.isLoading,
    updateAchievement: updateAchievementMutation.mutateAsync,
    isUpdatingAchievement: updateAchievementMutation.isLoading,
    deleteAchievement: deleteAchievementMutation.mutateAsync,
    isDeletingAchievement: deleteAchievementMutation.isLoading,
    saveTraining: saveTrainingMutation.mutateAsync,
    isSavingTraining: saveTrainingMutation.isLoading,
    updateTraining: updateTrainingMutation.mutateAsync,
    isUpdatingTraining: updateTrainingMutation.isLoading,
    deleteTraining: deleteTrainingMutation.mutateAsync,
    isDeletingTraining: deleteTrainingMutation.isLoading,
  };
};
