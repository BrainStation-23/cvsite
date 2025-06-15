
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for general information
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoFormData>({
    firstName: '',
    lastName: '',
    biography: '',
    profileImage: null,
    currentDesignation: null
  });

  // State for technical skills
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([]);

  // State for specialized skills
  const [specializedSkills, setSpecializedSkills] = useState<Skill[]>([]);

  // State for experiences
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // State for education
  const [education, setEducation] = useState<Education[]>([]);

  // State for trainings
  const [trainings, setTrainings] = useState<Training[]>([]);

  // State for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchTechnicalSkills = async () => {
    if (!user?.id) return;

    try {
      const { data: skills, error } = await supabase
        .from('technical_skills')
        .select('*')
        .eq('profile_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;

      setTechnicalSkills(skills || []);
    } catch (error) {
      console.error('Error fetching technical skills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load technical skills',
        variant: 'destructive'
      });
    }
  };

  const fetchSpecializedSkills = async () => {
    if (!user?.id) return;

    try {
      const { data: skills, error } = await supabase
        .from('specialized_skills')
        .select('*')
        .eq('profile_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;

      setSpecializedSkills(skills || []);
    } catch (error) {
      console.error('Error fetching specialized skills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load specialized skills',
        variant: 'destructive'
      });
    }
  };

  const fetchExperiences = async () => {
    if (!user?.id) return;

    try {
      const { data: exp, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setExperiences(exp?.map(e => ({
        id: e.id,
        companyName: e.company_name,
        designation: e.designation,
        startDate: new Date(e.start_date),
        endDate: e.end_date ? new Date(e.end_date) : undefined,
        isCurrent: e.is_current,
        description: e.description
      })) || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load experiences',
        variant: 'destructive'
      });
    }
  };

  const fetchEducation = async () => {
    if (!user?.id) return;

    try {
      const { data: edu, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setEducation(edu?.map(e => ({
        id: e.id,
        university: e.university,
        degree: e.degree,
        department: e.department,
        startDate: new Date(e.start_date),
        endDate: e.end_date ? new Date(e.end_date) : undefined,
        isCurrent: e.is_current,
        gpa: e.gpa
      })) || []);
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: 'Error',
        description: 'Failed to load education',
        variant: 'destructive'
      });
    }
  };

  const fetchTrainings = async () => {
    if (!user?.id) return;

    try {
      const { data: trainingData, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('profile_id', user.id)
        .order('certification_date', { ascending: false });

      if (error) throw error;

      setTrainings(trainingData?.map(training => ({
        id: training.id,
        title: training.title,
        provider: training.provider,
        date: new Date(training.certification_date),
        description: training.description,
        certificateUrl: training.certificate_url
      })) || []);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trainings',
        variant: 'destructive'
      });
    }
  };

  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      const { data: achievementData, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setAchievements(achievementData?.map(achievement => ({
        id: achievement.id,
        title: achievement.title,
        date: new Date(achievement.date),
        description: achievement.description
      })) || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive'
      });
    }
  };

  const fetchProjects = async () => {
    if (!user?.id) return;

    try {
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setProjects(projectData?.map(project => ({
        id: project.id,
        name: project.name,
        role: project.role,
        startDate: new Date(project.start_date),
        endDate: project.end_date ? new Date(project.end_date) : undefined,
        isCurrent: project.is_current,
        description: project.description,
        technologiesUsed: project.technologies_used,
        url: project.url
      })) || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
    }
  };

  const fetchGeneralInfo = async () => {
    if (!user?.id) return;

    try {
      const { data: generalData, error: generalError } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (generalError) throw generalError;

      if (generalData) {
        setGeneralInfo({
          firstName: generalData.first_name || '',
          lastName: generalData.last_name || '',
          biography: generalData.biography || '',
          profileImage: generalData.profile_image || null,
          currentDesignation: generalData.current_designation || null
        });
      }
    } catch (error) {
      console.error('Error fetching general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load general information',
        variant: 'destructive'
      });
    }
  };

  const saveGeneralInfo = async (data: GeneralInfoFormData) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingData) {
        const { error } = await supabase
          .from('general_information')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography,
            profile_image: data.profileImage,
            current_designation: data.currentDesignation,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('general_information')
          .insert({
            profile_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            biography: data.biography,
            profile_image: data.profileImage,
            current_designation: data.currentDesignation
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setGeneralInfo(data);
      
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

  const saveTechnicalSkill = async (skill: Skill) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      if (skill.id) {
        // Update existing skill
        const { error } = await supabase
          .from('technical_skills')
          .update({
            name: skill.name,
            proficiency: skill.proficiency,
            priority: skill.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', skill.id);
        
        if (error) throw error;
      } else {
        // Create new skill
        const { error } = await supabase
          .from('technical_skills')
          .insert({
            profile_id: user.id,
            name: skill.name,
            proficiency: skill.proficiency,
            priority: skill.priority
          });
        
        if (error) throw error;
      }

      await fetchTechnicalSkills();

      toast({
        title: 'Success',
        description: 'Technical skill has been updated',
      });

      return true;
    } catch (error) {
      console.error('Error saving technical skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to update technical skill',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveSpecializedSkill = async (skill: Skill) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      if (skill.id) {
        // Update existing skill
        const { error } = await supabase
          .from('specialized_skills')
          .update({
            name: skill.name,
            proficiency: skill.proficiency,
            priority: skill.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', skill.id);
        
        if (error) throw error;
      } else {
        // Create new skill
        const { error } = await supabase
          .from('specialized_skills')
          .insert({
            profile_id: user.id,
            name: skill.name,
            proficiency: skill.proficiency,
            priority: skill.priority
          });
        
        if (error) throw error;
      }

      await fetchSpecializedSkills();

      toast({
        title: 'Success',
        description: 'Specialized skill has been updated',
      });

      return true;
    } catch (error) {
      console.error('Error saving specialized skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to update specialized skill',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTechnicalSkill = async (id: string) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('technical_skills')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchTechnicalSkills();

      toast({
        title: 'Success',
        description: 'Technical skill has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting technical skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete technical skill',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSpecializedSkill = async (id: string) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('specialized_skills')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchSpecializedSkills();

      toast({
        title: 'Success',
        description: 'Specialized skill has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting specialized skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete specialized skill',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const reorderTechnicalSkills = async (skills: Skill[]) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      // Update the priority of each skill
      for (const skill of skills) {
        const { error } = await supabase
          .from('technical_skills')
          .update({ priority: skill.priority })
          .eq('id', skill.id)
          .eq('profile_id', user.id);

        if (error) throw error;
      }

      await fetchTechnicalSkills();

      toast({
        title: 'Success',
        description: 'Technical skills have been reordered',
      });

      return true;
    } catch (error) {
      console.error('Error reordering technical skills:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder technical skills',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const reorderSpecializedSkills = async (skills: Skill[]) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      // Update the priority of each skill
      for (const skill of skills) {
        const { error } = await supabase
          .from('specialized_skills')
          .update({ priority: skill.priority })
          .eq('id', skill.id)
          .eq('profile_id', user.id);

        if (error) throw error;
      }

      await fetchSpecializedSkills();

      toast({
        title: 'Success',
        description: 'Specialized skills have been reordered',
      });

      return true;
    } catch (error) {
      console.error('Error reordering specialized skills:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder specialized skills',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveExperience = async (experience: Omit<Experience, 'id'>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('experiences')
        .insert({
          profile_id: user.id,
          company_name: experience.companyName,
          designation: experience.designation,
          start_date: experience.startDate.toISOString(),
          end_date: experience.endDate?.toISOString() || null,
          is_current: experience.isCurrent || false,
          description: experience.description
        });

      if (error) throw error;

      await fetchExperiences();

      toast({
        title: 'Success',
        description: 'Experience has been saved',
      });

      return true;
    } catch (error) {
      console.error('Error saving experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to save experience',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateExperience = async (id: string, experience: Partial<Experience>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('experiences')
        .update({
          company_name: experience.companyName,
          designation: experience.designation,
          start_date: experience.startDate?.toISOString(),
          end_date: experience.endDate?.toISOString() || null,
          is_current: experience.isCurrent,
          description: experience.description
        })
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchExperiences();

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
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchExperiences();

      toast({
        title: 'Success',
        description: 'Experience has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete experience',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveEducation = async (education: Omit<Education, 'id'>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('education')
        .insert({
          profile_id: user.id,
          university: education.university,
          degree: education.degree,
          department: education.department,
          start_date: education.startDate.toISOString(),
          end_date: education.endDate?.toISOString() || null,
          is_current: education.isCurrent || false,
          gpa: education.gpa
        });

      if (error) throw error;

      await fetchEducation();

      toast({
        title: 'Success',
        description: 'Education has been saved',
      });

      return true;
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: 'Error',
        description: 'Failed to save education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEducation = async (id: string, education: Partial<Education>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('education')
        .update({
          university: education.university,
          degree: education.degree,
          department: education.department,
          start_date: education.startDate?.toISOString(),
          end_date: education.endDate?.toISOString() || null,
          is_current: education.isCurrent,
          gpa: education.gpa
        })
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchEducation();

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
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchEducation();

      toast({
        title: 'Success',
        description: 'Education has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveTraining = async (training: Omit<Training, 'id'>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('trainings')
        .insert({
          profile_id: user.id,
          title: training.title,
          provider: training.provider,
          certification_date: training.date.toISOString(),
          description: training.description,
          certificate_url: training.certificateUrl
        });

      if (error) throw error;

      await fetchTrainings();

      toast({
        title: 'Success',
        description: 'Training has been saved',
      });

      return true;
    } catch (error) {
      console.error('Error saving training:', error);
      toast({
        title: 'Error',
        description: 'Failed to save training',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateTraining = async (id: string, training: Partial<Training>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('trainings')
        .update({
          title: training.title,
          provider: training.provider,
          certification_date: training.date?.toISOString(),
          description: training.description,
          certificate_url: training.certificateUrl
        })
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchTrainings();

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
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchTrainings();

      toast({
        title: 'Success',
        description: 'Training has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting training:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete training',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveAchievement = async (achievement: Omit<Achievement, 'id'>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('achievements')
        .insert({
          profile_id: user.id,
          title: achievement.title,
          date: achievement.date.toISOString(),
          description: achievement.description
        });

      if (error) throw error;

      await fetchAchievements();

      toast({
        title: 'Success',
        description: 'Achievement has been saved',
      });

      return true;
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save achievement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAchievement = async (id: string, achievement: Partial<Achievement>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('achievements')
        .update({
          title: achievement.title,
          date: achievement.date?.toISOString(),
          description: achievement.description
        })
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchAchievements();

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
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchAchievements();

      toast({
        title: 'Success',
        description: 'Achievement has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete achievement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveProject = async (project: Omit<Project, 'id'>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('projects')
        .insert({
          profile_id: user.id,
          name: project.name,
          role: project.role,
          start_date: project.startDate.toISOString().split('T')[0],
          end_date: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
          is_current: project.isCurrent || false,
          description: project.description,
          technologies_used: project.technologiesUsed,
          url: project.url || null
        });

      if (error) throw error;

      await fetchProjects();

      toast({
        title: 'Success',
        description: 'Project has been saved',
      });

      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      // Create a clean database update object with only the fields that need updating
      const updateData: Record<string, any> = {};
      
      // Map each field explicitly to ensure correct column names
      if (project.name !== undefined) {
        updateData.name = project.name;
      }
      if (project.role !== undefined) {
        updateData.role = project.role;
      }
      if (project.description !== undefined) {
        updateData.description = project.description;
      }
      if (project.startDate !== undefined) {
        updateData.start_date = project.startDate.toISOString().split('T')[0];
      }
      if (project.endDate !== undefined) {
        updateData.end_date = project.endDate ? project.endDate.toISOString().split('T')[0] : null;
      }
      if (project.isCurrent !== undefined) {
        updateData.is_current = project.isCurrent;
      }
      if (project.technologiesUsed !== undefined) {
        updateData.technologies_used = project.technologiesUsed;
      }
      if (project.url !== undefined) {
        updateData.url = project.url || null;
      }

      console.log('Updating project with database data:', updateData);
      console.log('Original project data received:', project);

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchProjects();

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
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;

      await fetchProjects();

      toast({
        title: 'Success',
        description: 'Project has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const reorderProjects = async (projects: Project[]) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);

      // Update the display_order of each project sequentially to avoid race conditions
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const { error } = await supabase
          .from('projects')
          .update({ display_order: i + 1 })
          .eq('id', project.id)
          .eq('profile_id', user.id);

        if (error) {
          console.error(`Error updating display order for project ${project.id}:`, error);
          throw error;
        }
      }

      await fetchProjects();

      toast({
        title: 'Success',
        description: 'Projects have been reordered',
      });

      return true;
    } catch (error) {
      console.error('Error reordering projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder projects',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user?.id]);

  const fetchAllData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    await Promise.all([
      fetchGeneralInfo(),
      fetchTechnicalSkills(),
      fetchSpecializedSkills(),
      fetchExperiences(),
      fetchEducation(),
      fetchTrainings(),
      fetchAchievements(),
      fetchProjects()
    ]);
    setIsLoading(false);
  };

  return {
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
  };
}
