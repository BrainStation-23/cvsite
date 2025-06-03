
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IncompleteProfile {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  missing_sections: string[];
}

interface DashboardAnalytics {
  totalEmployees: number;
  profilesCompleted: number;
  completionRate: number;
  skillMatrix: Array<{ skill: string; count: number }>;
  experienceDistribution: Array<{ range: string; count: number }>;
  incompleteProfiles: IncompleteProfile[];
}

interface DashboardAnalyticsResponse {
  totalEmployees: number;
  profilesCompleted: number;
  completionRate: number;
  skillMatrix: Array<{ skill: string; count: number }>;
  experienceDistribution: Array<{ range: string; count: number }>;
  incompleteProfiles: IncompleteProfile[];
}

export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    totalEmployees: 0,
    profilesCompleted: 0,
    completionRate: 0,
    skillMatrix: [],
    experienceDistribution: [],
    incompleteProfiles: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Call the RPC function to get all dashboard analytics
      const { data, error } = await supabase.rpc('get_dashboard_analytics');

      if (error) {
        throw error;
      }

      console.log('Dashboard analytics data:', data);

      // Parse the JSON response and set the analytics state
      if (data) {
        const analyticsData = data as unknown as DashboardAnalyticsResponse;
        setAnalytics({
          totalEmployees: analyticsData.totalEmployees || 0,
          profilesCompleted: analyticsData.profilesCompleted || 0,
          completionRate: analyticsData.completionRate || 0,
          skillMatrix: analyticsData.skillMatrix || [],
          experienceDistribution: analyticsData.experienceDistribution || [],
          incompleteProfiles: analyticsData.incompleteProfiles || []
        });
      }

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
