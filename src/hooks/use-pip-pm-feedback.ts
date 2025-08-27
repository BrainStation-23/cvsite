
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PIPPMFeedback, PIPPMFeedbackFormData, PIPDetailsResponse } from '@/types/pip';

export function usePIPPMFeedback(pipId: string | null) {
  const queryClient = useQueryClient();

  // Fetch PIP details with profile information
  const { data: pipDetails, isLoading, error } = useQuery({
    queryKey: ['pip-details', pipId],
    queryFn: async (): Promise<PIPDetailsResponse> => {
      if (!pipId) throw new Error('PIP ID is required');

      const { data, error } = await supabase.rpc('get_pip_profile_details', {
        pip_id: pipId
      });

      if (error) {
        console.error('Error fetching PIP details:', error);
        throw error;
      }

      return data as PIPDetailsResponse;
    },
    enabled: !!pipId,
  });

  // Create PM feedback mutation
  const createPMFeedbackMutation = useMutation({
    mutationFn: async (formData: PIPPMFeedbackFormData) => {
      if (!pipId) throw new Error('PIP ID is required');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pip_pm_feedback')
        .insert({
          pip_id: pipId,
          skill_areas: formData.skill_areas,
          skill_gap_description: formData.skill_gap_description,
          skill_gap_example: formData.skill_gap_example,
          behavioral_areas: formData.behavioral_areas,
          behavioral_gap_description: formData.behavioral_gap_description,
          behavioral_gap_example: formData.behavioral_gap_example,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('PM feedback submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['pip-details', pipId] });
    },
    onError: (error) => {
      console.error('Error submitting PM feedback:', error);
      toast.error('Failed to submit PM feedback');
    },
  });

  // Update PM feedback mutation
  const updatePMFeedbackMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PIPPMFeedbackFormData> }) => {
      const { data, error } = await supabase
        .from('pip_pm_feedback')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('PM feedback updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pip-details', pipId] });
    },
    onError: (error) => {
      console.error('Error updating PM feedback:', error);
      toast.error('Failed to update PM feedback');
    },
  });

  // Update PIP status mutation
  const updatePIPStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!pipId) throw new Error('PIP ID is required');

      const { data, error } = await supabase
        .from('performance_improvement_plans')
        .update({ status: newStatus })
        .eq('id', pipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('PIP status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pip-details', pipId] });
      queryClient.invalidateQueries({ queryKey: ['pips'] });
    },
    onError: (error) => {
      console.error('Error updating PIP status:', error);
      toast.error('Failed to update PIP status');
    },
  });

  return {
    pipDetails,
    isLoading,
    error,
    createPMFeedback: createPMFeedbackMutation.mutate,
    updatePMFeedback: updatePMFeedbackMutation.mutate,
    updatePIPStatus: updatePIPStatusMutation.mutate,
    isCreating: createPMFeedbackMutation.isPending,
    isUpdating: updatePMFeedbackMutation.isPending,
    isUpdatingStatus: updatePIPStatusMutation.isPending,
  };
}
