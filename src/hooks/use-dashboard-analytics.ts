
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

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

  const exportIncompleteProfiles = () => {
    try {
      const csvData = analytics.incompleteProfiles.map(profile => ({
        employee_id: profile.employee_id || '',
        first_name: profile.first_name,
        last_name: profile.last_name,
        missing_sections: profile.missing_sections.join(', '),
        missing_sections_count: profile.missing_sections.length
      }));

      const csv = Papa.unparse(csvData, {
        header: true
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `incomplete_profiles_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export successful',
        description: 'Incomplete profiles have been exported to CSV file',
      });

      console.log('Incomplete profiles exported successfully');
    } catch (error) {
      console.error('Error exporting incomplete profiles:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the incomplete profiles',
        variant: 'destructive',
      });
    }
  };

  return {
    analytics,
    isLoading,
    refetch: fetchAnalytics,
    exportIncompleteProfiles
  };
}
