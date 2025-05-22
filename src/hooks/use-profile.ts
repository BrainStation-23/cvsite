
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  EmployeeProfile, 
  Skill, 
  Experience, 
  Education, 
  Training, 
  Achievement, 
  Project 
} from '@/types';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  designation: string;
  biography: string;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<{
    firstName: string;
    lastName: string;
    designation: string | null;
    biography: string | null;
    profileImage: string | null;
  }>({
    firstName: '',
    lastName: '',
    designation: null,
    biography: null,
    profileImage: null
  });
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([]);
  const [specializedSkills, setSpecializedSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch general info
  const fetchGeneralInfo = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error } = await supabase
            .from('profiles')
            .insert({ id: user.id });
            
          if (error) throw error;
        } else {
          throw profileError;
        }
      }
      
      // Get general info
      const { data, error } = await supabase
        .from('general_information')
        .select('*')
        .eq('profile_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setGeneralInfo({
          firstName: data.first_name,
          lastName: data.last_name,
          designation: data.designation,
          biography: data.biography,
          profileImage: data.profile_image
        });
      } else {
        // Use user data as fallback
        setGeneralInfo({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          designation: null,
          biography: null,
          profileImage: user.profileImageUrl || null
        });
      }
    } catch (error) {
      console.error('Error fetching general info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch technical skills
  const fetchTechnicalSkills = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('technical_skills')
        .select('*')
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setTechnicalSkills(data.map(skill => ({
          id: skill.id,
          name: skill.name,
          proficiency: skill.proficiency
        })));
      }
    } catch (error) {
      console.error('Error fetching technical skills:', error);
    }
  };

  // Fetch specialized skills
  const fetchSpecializedSkills = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('specialized_skills')
        .select('*')
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setSpecializedSkills(data.map(skill => ({
          id: skill.id,
          name: skill.name,
          proficiency: skill.proficiency
        })));
      }
    } catch (error) {
      console.error('Error fetching specialized skills:', error);
    }
  };

  // Save general info
  const saveGeneralInfo = async (data: {
    firstName: string;
    lastName: string;
    designation: string | null;
    biography: string | null;
  }) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      
      // First, check if a record exists
      const { data: existingData, error: checkError } = await supabase
        .from('general_information')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('general_information')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            designation: data.designation,
            biography: data.biography,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('general_information')
          .insert({
            profile_id: user.id,
            org_id: 'default', // Default org ID, replace with actual org ID if available
            first_name: data.firstName,
            last_name: data.lastName,
            designation: data.designation,
            biography: data.biography
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setGeneralInfo(prev => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        designation: data.designation,
        biography: data.biography
      }));
      
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

  // Save technical skill
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
            updated_at: new Date().toISOString()
          })
          .eq('id', skill.id);
        
        if (error) throw error;
      } else {
        // Create new skill
        const { data, error } = await supabase
          .from('technical_skills')
          .insert({
            profile_id: user.id,
            name: skill.name,
            proficiency: skill.proficiency
          })
          .select();
        
        if (error) throw error;
        
        skill = { ...skill, id: data[0].id };
      }
      
      // Update local state
      setTechnicalSkills(prev => {
        const index = prev.findIndex(s => s.id === skill.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = skill;
          return updated;
        } else {
          return [...prev, skill];
        }
      });
      
      toast({
        title: 'Success',
        description: 'Technical skill has been saved',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving technical skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to save technical skill',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Save specialized skill
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
            updated_at: new Date().toISOString()
          })
          .eq('id', skill.id);
        
        if (error) throw error;
      } else {
        // Create new skill
        const { data, error } = await supabase
          .from('specialized_skills')
          .insert({
            profile_id: user.id,
            name: skill.name,
            proficiency: skill.proficiency
          })
          .select();
        
        if (error) throw error;
        
        skill = { ...skill, id: data[0].id };
      }
      
      // Update local state
      setSpecializedSkills(prev => {
        const index = prev.findIndex(s => s.id === skill.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = skill;
          return updated;
        } else {
          return [...prev, skill];
        }
      });
      
      toast({
        title: 'Success',
        description: 'Specialized skill has been saved',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving specialized skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to save specialized skill',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete technical skill
  const deleteTechnicalSkill = async (skillId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('technical_skills')
        .delete()
        .eq('id', skillId)
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setTechnicalSkills(prev => prev.filter(skill => skill.id !== skillId));
      
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

  // Delete specialized skill
  const deleteSpecializedSkill = async (skillId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('specialized_skills')
        .delete()
        .eq('id', skillId)
        .eq('profile_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSpecializedSkills(prev => prev.filter(skill => skill.id !== skillId));
      
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

  // Load profile data
  useEffect(() => {
    if (user?.id) {
      fetchGeneralInfo();
      fetchTechnicalSkills();
      fetchSpecializedSkills();
      // We can add other fetch functions as needed
    }
  }, [user?.id]);

  return {
    // State
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
    
    // Methods
    saveGeneralInfo,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill
  };
}
