
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skill } from '@/types';

export function useSkills(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([]);
  const [specializedSkills, setSpecializedSkills] = useState<Skill[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch technical skills
  const fetchTechnicalSkills = async () => {
    if (!targetProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('technical_skills')
        .select('*')
        .eq('profile_id', targetProfileId);
      
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
    if (!targetProfileId) return;
    
    try {
      const { data, error } = await supabase
        .from('specialized_skills')
        .select('*')
        .eq('profile_id', targetProfileId);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Save technical skill
  const saveTechnicalSkill = async (skill: Skill) => {
    if (!targetProfileId) return false;
    
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
            profile_id: targetProfileId,
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
    if (!targetProfileId) return false;
    
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
            profile_id: targetProfileId,
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
    if (!targetProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('technical_skills')
        .delete()
        .eq('id', skillId)
        .eq('profile_id', targetProfileId);
      
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
    if (!targetProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('specialized_skills')
        .delete()
        .eq('id', skillId)
        .eq('profile_id', targetProfileId);
      
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

  // Load skills data
  useEffect(() => {
    if (targetProfileId) {
      setIsLoading(true);
      Promise.all([
        fetchTechnicalSkills(),
        fetchSpecializedSkills()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [targetProfileId]);

  return {
    isLoading,
    isSaving,
    technicalSkills,
    specializedSkills,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill
  };
}
