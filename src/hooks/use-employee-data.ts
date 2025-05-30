
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEmployeeData(profileId: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployeeData = useCallback(async () => {
    if (!profileId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching employee data for profile:', profileId);

      const { data: result, error } = await supabase.rpc('get_employee_data', {
        profile_uuid: profileId
      });

      if (error) {
        console.error('Error fetching employee data:', error);
        throw error;
      }

      console.log('Employee data fetched successfully:', result);
      setData(result);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        title: "Error",
        description: "Failed to load employee data",
        variant: "destructive"
      });
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, toast]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const refetch = useCallback(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  return {
    data,
    isLoading,
    refetch
  };
}
