
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardAnalytics {
  totalEmployees: number;
  profilesCompleted: number;
  completionRate: number;
  skillMatrix: Array<{ skill: string; count: number }>;
  experienceDistribution: Array<{ range: string; count: number }>;
}

export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    totalEmployees: 0,
    profilesCompleted: 0,
    completionRate: 0,
    skillMatrix: [],
    experienceDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get total employees count
      const { count: totalEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get profiles with completed general information
      const { count: profilesCompleted } = await supabase
        .from('general_information')
        .select('*', { count: 'exact', head: true })
        .not('biography', 'is', null)
        .not('first_name', 'is', null)
        .not('last_name', 'is', null);

      // Get skill matrix (top 10 skills)
      const { data: skillsData } = await supabase
        .from('technical_skills')
        .select('name')
        .order('name');

      const skillCounts = skillsData?.reduce((acc, skill) => {
        acc[skill.name] = (acc[skill.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const skillMatrix = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get experience distribution
      const { data: experiencesData } = await supabase
        .from('experiences')
        .select('start_date, end_date, is_current');

      const experienceYears = experiencesData?.map(exp => {
        const startDate = new Date(exp.start_date);
        const endDate = exp.is_current ? new Date() : new Date(exp.end_date);
        return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
      }) || [];

      const experienceRanges = {
        '0-1 years': 0,
        '2-3 years': 0,
        '4-5 years': 0,
        '6-10 years': 0,
        '10+ years': 0
      };

      experienceYears.forEach(years => {
        if (years <= 1) experienceRanges['0-1 years']++;
        else if (years <= 3) experienceRanges['2-3 years']++;
        else if (years <= 5) experienceRanges['4-5 years']++;
        else if (years <= 10) experienceRanges['6-10 years']++;
        else experienceRanges['10+ years']++;
      });

      const experienceDistribution = Object.entries(experienceRanges)
        .map(([range, count]) => ({ range, count }));

      setAnalytics({
        totalEmployees: totalEmployees || 0,
        profilesCompleted: profilesCompleted || 0,
        completionRate: totalEmployees ? Math.round(((profilesCompleted || 0) / totalEmployees) * 100) : 0,
        skillMatrix,
        experienceDistribution
      });

    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      toast({
        title: 'Error fetching dashboard data',
        description: 'There was an error loading the dashboard analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analytics,
    isLoading,
    refetch: fetchAnalytics
  };
}
