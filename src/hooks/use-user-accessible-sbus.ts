import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserAccessibleSbuItem {
  id: string;
  name: string;
  sbu_head_email: string | null;
  sbu_head_name: string | null;
  is_department: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface UserAccessibleSbuParams {
  searchQuery?: string | null;
  targetUserId?: string | null;
}

export interface UserAccessibleSbuResult {
  sbus: UserAccessibleSbuItem[];
  defaultSbuId: string | null;
  isSbuBound: boolean;
}

export const useUserAccessibleSbus = (params: UserAccessibleSbuParams = {}) => {
  const { searchQuery = null, targetUserId = null } = params;

  return useQuery({
    queryKey: ['user-accessible-sbus', targetUserId, searchQuery],
    queryFn: async (): Promise<UserAccessibleSbuResult> => {
      const { data, error } = await supabase.rpc('get_user_accessible_sbus', {
        target_user_id: targetUserId,
        search_query: searchQuery,
      });

      if (error) throw error;

      // Type assertion for the JSON return from the RPC function
      const result = (data as unknown) as {
        sbus: UserAccessibleSbuItem[];
        default_sbu_id: string | null;
        is_sbu_bound: boolean;
      } | null;

      return {
        sbus: result?.sbus || [],
        defaultSbuId: result?.default_sbu_id || null,
        isSbuBound: result?.is_sbu_bound || false,
      };
    },
  });
};