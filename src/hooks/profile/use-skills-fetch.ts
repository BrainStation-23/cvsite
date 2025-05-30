
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

interface Skill {
  id: string;
  name: string;
  created_at: string;
}

const useSkillsFetch = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['skills', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      // Fetch both technical and specialized skills
      const [technicalSkillsResult, specializedSkillsResult] = await Promise.all([
        supabase
          .from('technical_skills')
          .select('*')
          .eq('profile_id', user.id)
          .order('name', { ascending: true }),
        supabase
          .from('specialized_skills')
          .select('*')
          .eq('profile_id', user.id)
          .order('name', { ascending: true })
      ]);

      if (technicalSkillsResult.error) {
        toast({
          title: 'Error fetching technical skills',
          description: technicalSkillsResult.error.message,
          variant: 'destructive',
        });
        throw technicalSkillsResult.error;
      }

      if (specializedSkillsResult.error) {
        toast({
          title: 'Error fetching specialized skills',
          description: specializedSkillsResult.error.message,
          variant: 'destructive',
        });
        throw specializedSkillsResult.error;
      }

      // Transform the data to match the expected format
      const technicalSkills = (technicalSkillsResult.data || []).map(skill => ({
        id: skill.id,
        name: skill.name,
        created_at: skill.created_at
      }));

      const specializedSkills = (specializedSkillsResult.data || []).map(skill => ({
        id: skill.id,
        name: skill.name,
        created_at: skill.created_at
      }));

      return [...technicalSkills, ...specializedSkills];
    },
    enabled: !!user?.id,
  });
};

export default useSkillsFetch;
