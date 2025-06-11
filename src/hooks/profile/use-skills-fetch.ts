
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skill } from '@/types';

export function useSkillsFetch(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([]);
  const [specializedSkills, setSpecializedSkills] = useState<Skill[]>([]);

  const fetchSkills = async () => {
    if (!profileId) return;

    try {
      // Fetch technical skills with priority ordering
      const { data: techSkillsData, error: techSkillsError } = await supabase
        .from('technical_skills')
        .select('*')
        .eq('profile_id', profileId)
        .order('priority', { ascending: true });

      if (techSkillsError) throw techSkillsError;

      if (techSkillsData) {
        setTechnicalSkills(techSkillsData.map(skill => ({
          id: skill.id,
          name: skill.name,
          proficiency: skill.proficiency,
          priority: skill.priority || 0
        })));
      }

      // Fetch specialized skills with priority ordering
      const { data: specSkillsData, error: specSkillsError } = await supabase
        .from('specialized_skills')
        .select('*')
        .eq('profile_id', profileId)
        .order('priority', { ascending: true });

      if (specSkillsError) throw specSkillsError;

      if (specSkillsData) {
        setSpecializedSkills(specSkillsData.map(skill => ({
          id: skill.id,
          name: skill.name,
          proficiency: skill.proficiency,
          priority: skill.priority || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load skills',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [profileId]);

  return {
    isLoading,
    technicalSkills,
    specializedSkills,
    refetch: fetchSkills
  };
}
