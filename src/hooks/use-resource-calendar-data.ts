
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfQuarter, endOfQuarter, startOfMonth, endOfMonth } from 'date-fns';

interface ResourceCalendarData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  } | null;
}

export function useResourceCalendarData(
  searchQuery: string,
  selectedSbu: string | null,
  selectedManager: string | null,
  currentDate: Date,
  viewType: 'month' | 'quarter' = 'quarter'
) {
  // Calculate date range based on view type
  const dateRange = viewType === 'quarter' 
    ? { start: startOfQuarter(currentDate), end: endOfQuarter(currentDate) }
    : { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };

  const { data: resourceData, isLoading, error } = useQuery({
    queryKey: [
      'resource-calendar-data', 
      searchQuery, 
      selectedSbu, 
      selectedManager, 
      dateRange.start.toISOString(), 
      dateRange.end.toISOString(),
      viewType
    ],
    queryFn: async () => {
      console.log('Fetching calendar data:', {
        searchQuery,
        selectedSbu,
        selectedManager,
        dateRange,
        viewType
      });

      // Use the new get_planned_resources RPC function with a high limit to get all records
      const { data: rpcData, error } = await supabase.rpc('get_planned_resources', {
        search_query: searchQuery || null,
        page_number: 1,
        items_per_page: 1000, // High limit to get all records
        sort_by: 'created_at',
        sort_order: 'desc',
        sbu_filter: selectedSbu,
        manager_filter: selectedManager
      });

      if (error) {
        console.error('RPC call error:', error);
        throw error;
      }
      
      console.log('Raw RPC response:', rpcData);

      if (rpcData && typeof rpcData === 'object' && 'resource_planning' in rpcData) {
        const allResources = (rpcData as any).resource_planning || [];
        
        // Filter resources that overlap with the date range
        const filteredResources = allResources.filter((resource: ResourceCalendarData) => {
          if (!resource.engagement_start_date) return false;
          
          const startDate = new Date(resource.engagement_start_date);
          const endDate = resource.release_date ? new Date(resource.release_date) : new Date('2099-12-31');
          
          // Check if resource engagement overlaps with the viewing period
          const overlaps = startDate <= dateRange.end && endDate >= dateRange.start;
          
          return overlaps;
        });

        console.log(`Filtered ${filteredResources.length} resources from ${allResources.length} total for date range:`, {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        });

        return filteredResources;
      } else {
        console.warn('Unexpected RPC response structure:', rpcData);
        return [];
      }
    }
  });

  return {
    data: resourceData || [],
    isLoading,
    error,
    dateRange
  };
}
