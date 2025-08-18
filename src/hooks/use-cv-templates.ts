
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CVTemplate {
  id: string;
  name: string;
  html_template: string;
  enabled: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useCVTemplates = () => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['cv-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cv_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching CV templates:', error);
        throw error;
      }

      return data as CVTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: { 
      name: string; 
      html_template: string; 
      enabled?: boolean; 
      is_default?: boolean; 
    }) => {
      const { data, error } = await supabase
        .from('cv_templates')
        .insert([{
          ...template,
          enabled: template.enabled ?? true,
          is_default: template.is_default ?? false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating CV template:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-templates'] });
      toast.success('CV template created successfully');
    },
    onError: (error) => {
      console.error('Error creating CV template:', error);
      toast.error('Failed to create CV template');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { 
      id: string; 
      name?: string; 
      html_template?: string; 
      enabled?: boolean; 
      is_default?: boolean; 
    }) => {
      const { data, error } = await supabase
        .from('cv_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating CV template:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-templates'] });
      toast.success('CV template updated successfully');
    },
    onError: (error) => {
      console.error('Error updating CV template:', error);
      toast.error('Failed to update CV template');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cv_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting CV template:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-templates'] });
      toast.success('CV template deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting CV template:', error);
      toast.error('Failed to delete CV template');
    },
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
};
