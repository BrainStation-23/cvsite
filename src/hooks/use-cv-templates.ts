import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CVTemplate {
  id: string;
  name: string;
  html_template: string;
  enabled: boolean;
  is_default: boolean;
  data_source_function: string;
  orientation: 'portrait' | 'landscape';
  technical_skills_limit: number;
  specialized_skills_limit: number;
  experiences_limit: number;
  education_limit: number;
  trainings_limit: number;
  achievements_limit: number;
  projects_limit: number;
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
      data_source_function?: string;
      orientation?: 'portrait' | 'landscape';
      technical_skills_limit?: number;
      specialized_skills_limit?: number;
      experiences_limit?: number;
      education_limit?: number;
      trainings_limit?: number;
      achievements_limit?: number;
      projects_limit?: number;
    }) => {
      const { data, error } = await supabase
        .from('cv_templates')
        .insert([{
          ...template,
          enabled: template.enabled ?? true,
          is_default: template.is_default ?? false,
          data_source_function: template.data_source_function ?? 'get_employee_data_masked',
          orientation: template.orientation ?? 'portrait',
          technical_skills_limit: template.technical_skills_limit ?? 5,
          specialized_skills_limit: template.specialized_skills_limit ?? 5,
          experiences_limit: template.experiences_limit ?? 5,
          education_limit: template.education_limit ?? 5,
          trainings_limit: template.trainings_limit ?? 5,
          achievements_limit: template.achievements_limit ?? 5,
          projects_limit: template.projects_limit ?? 5,
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
      data_source_function?: string;
      orientation?: 'portrait' | 'landscape';
      technical_skills_limit?: number;
      specialized_skills_limit?: number;
      experiences_limit?: number;
      education_limit?: number;
      trainings_limit?: number;
      achievements_limit?: number;
      projects_limit?: number;
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
