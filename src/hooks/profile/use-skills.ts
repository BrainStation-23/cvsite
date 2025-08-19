
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skill } from '@/types';
import { useSkillsFetch } from './use-skills-fetch';
import { useSkillsOperations } from './skills/use-skills-operations';
import { useSkillsReorder } from './skills/use-skills-reorder';

export function useSkills(profileId?: string) {
  const { user } = useAuth();
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([]);
  const [specializedSkills, setSpecializedSkills] = useState<Skill[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Use the fetch hook
  const { 
    isLoading, 
    technicalSkills: fetchedTechnicalSkills, 
    specializedSkills: fetchedSpecializedSkills,
    refetch
  } = useSkillsFetch(targetProfileId || '');

  // Use the operations hook
  const {
    isSaving: operationsSaving,
    saveTechnicalSkill: saveSkill,
    saveSpecializedSkill: saveSpecSkill,
    deleteTechnicalSkill: deleteSkill,
    deleteSpecializedSkill: deleteSpecSkill
  } = useSkillsOperations(targetProfileId);

  // Use the reorder hook
  const {
    isSaving: reorderSaving,
    reorderTechnicalSkills: reorderTechSkills,
    reorderSpecializedSkills: reorderSpecSkills
  } = useSkillsReorder(targetProfileId);

  // Update local state when fetch data changes
  useEffect(() => {
    setTechnicalSkills(fetchedTechnicalSkills);
    setSpecializedSkills(fetchedSpecializedSkills);
  }, [fetchedTechnicalSkills, fetchedSpecializedSkills]);

  // Enhanced save functions that update local state
  const saveTechnicalSkill = async (skill: Skill) => {
    const success = await saveSkill(skill);
    if (success) {
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
      // Refetch to ensure consistency
      refetch();
    }
    return success;
  };

  const saveSpecializedSkill = async (skill: Skill) => {
    const success = await saveSpecSkill(skill);
    if (success) {
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
      // Refetch to ensure consistency
      refetch();
    }
    return success;
  };

  const deleteTechnicalSkill = async (skillId: string) => {
    const success = await deleteSkill(skillId);
    if (success) {
      setTechnicalSkills(prev => prev.filter(skill => skill.id !== skillId));
    }
    return success;
  };

  const deleteSpecializedSkill = async (skillId: string) => {
    const success = await deleteSpecSkill(skillId);
    if (success) {
      setSpecializedSkills(prev => prev.filter(skill => skill.id !== skillId));
    }
    return success;
  };

  // Enhanced reorder functions that update local state optimistically
  const reorderTechnicalSkills = async (reorderedSkills: Skill[]): Promise<boolean> => {
    // Update local state immediately for optimistic UI
    setTechnicalSkills(reorderedSkills.map((skill, index) => ({
      ...skill,
      priority: index + 1
    })));
    
    const success = await reorderTechSkills(reorderedSkills);
    if (!success) {
      // Revert on failure
      refetch();
    }
    return success;
  };

  const reorderSpecializedSkills = async (reorderedSkills: Skill[]): Promise<boolean> => {
    // Update local state immediately for optimistic UI
    setSpecializedSkills(reorderedSkills.map((skill, index) => ({
      ...skill,
      priority: index + 1
    })));
    
    const success = await reorderSpecSkills(reorderedSkills);
    if (!success) {
      // Revert on failure
      refetch();
    }
    return success;
  };

  const isSaving = operationsSaving || reorderSaving;

  return {
    isLoading,
    isSaving,
    technicalSkills,
    specializedSkills,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill,
    reorderTechnicalSkills,
    reorderSpecializedSkills
  };
}
