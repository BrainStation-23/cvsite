
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types';

export function useSkillsOperations(targetProfileId?: string) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Save technical skill with priority
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
            priority: skill.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', skill.id);
        
        if (error) throw error;
      } else {
        // Create new skill with highest priority
        const { data: existingSkills } = await supabase
          .from('technical_skills')
          .select('priority')
          .eq('profile_id', targetProfileId)
          .order('priority', { ascending: false })
          .limit(1);
        
        const maxPriority = existingSkills && existingSkills.length > 0 ? existingSkills[0].priority : 0;
        
        const { data, error } = await supabase
          .from('technical_skills')
          .insert({
            profile_id: targetProfileId,
            name: skill.name,
            proficiency: skill.proficiency,
            priority: maxPriority + 1
          })
          .select();
        
        if (error) throw error;
        
        skill = { ...skill, id: data[0].id, priority: maxPriority + 1 };
      }
      
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

  // Save specialized skill with priority
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
            priority: skill.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', skill.id);
        
        if (error) throw error;
      } else {
        // Create new skill with highest priority
        const { data: existingSkills } = await supabase
          .from('specialized_skills')
          .select('priority')
          .eq('profile_id', targetProfileId)
          .order('priority', { ascending: false })
          .limit(1);
        
        const maxPriority = existingSkills && existingSkills.length > 0 ? existingSkills[0].priority : 0;
        
        const { data, error } = await supabase
          .from('specialized_skills')
          .insert({
            profile_id: targetProfileId,
            name: skill.name,
            proficiency: skill.proficiency,
            priority: maxPriority + 1
          })
          .select();
        
        if (error) throw error;
        
        skill = { ...skill, id: data[0].id, priority: maxPriority + 1 };
      }
      
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

  return {
    isSaving,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill
  };
}
