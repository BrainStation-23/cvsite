
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types';

export function useSkillsReorder(targetProfileId?: string) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Reorder technical skills - returns boolean for success/failure
  const reorderTechnicalSkills = async (reorderedSkills: Skill[]): Promise<boolean> => {
    if (!targetProfileId) {
      console.error('No profile ID available');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Update priorities in the database
      const updates = reorderedSkills.map((skill, index) => ({
        id: skill.id,
        priority: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('technical_skills')
          .update({ priority: update.priority })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
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

  // Reorder specialized skills - returns boolean for success/failure
  const reorderSpecializedSkills = async (reorderedSkills: Skill[]): Promise<boolean> => {
    if (!targetProfileId) {
      console.error('No profile ID available');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Update priorities in the database
      const updates = reorderedSkills.map((skill, index) => ({
        id: skill.id,
        priority: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('specialized_skills')
          .update({ priority: update.priority })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
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

  return {
    isSaving,
    reorderTechnicalSkills,
    reorderSpecializedSkills
  };
}
