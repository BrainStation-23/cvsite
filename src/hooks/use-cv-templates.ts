import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CVTemplate, CVTemplateSection, CVTemplateFieldMapping } from '@/types/cv-templates';

interface CreateTemplateData {
  name: string;
  description?: string;
  pages_count: number;
  orientation: 'portrait' | 'landscape';
  is_active: boolean;
  layout_config: Record<string, any>;
}

// Type for Supabase response to handle the string -> union type conversion
interface SupabaseCVTemplate {
  id: string;
  name: string;
  description?: string;
  pages_count: number;
  orientation: string;
  layout_config: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useCVTemplates = () => {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert Supabase response to proper CVTemplate type
      const typedTemplates: CVTemplate[] = (data || []).map((template: SupabaseCVTemplate) => ({
        ...template,
        orientation: template.orientation as 'portrait' | 'landscape',
        layout_config: (template.layout_config && typeof template.layout_config === 'object') 
          ? template.layout_config as Record<string, any>
          : {}
      }));
      
      setTemplates(typedTemplates);
    } catch (error) {
      console.error('Error fetching CV templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch CV templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (templateData: CreateTemplateData): Promise<boolean> => {
    try {
      setIsCreating(true);
      console.log('Starting template creation...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        toast({
          title: "Authentication Error",
          description: "Please log in again to create templates",
          variant: "destructive"
        });
        return false;
      }
      
      if (!user) {
        console.error('No user found');
        toast({
          title: "Error",
          description: "You must be logged in to create templates",
          variant: "destructive"
        });
        return false;
      }

      console.log('User authenticated, creating template...');

      const { data, error } = await supabase
        .from('cv_templates')
        .insert([{
          ...templateData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Template creation error:', error);
        throw error;
      }

      console.log('Template created successfully:', data);

      toast({
        title: "Success",
        description: "CV template created successfully"
      });

      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error('Error creating CV template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create CV template",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<CreateTemplateData>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('cv_templates')
        .update({
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "CV template updated successfully"
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error updating CV template:', error);
      toast({
        title: "Error",
        description: "Failed to update CV template",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cv_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "CV template deleted successfully"
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting CV template:', error);
      toast({
        title: "Error",
        description: "Failed to delete CV template",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTemplate = async (id: string): Promise<CVTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('cv_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Convert Supabase response to proper CVTemplate type
      const typedTemplate: CVTemplate = {
        ...data,
        orientation: data.orientation as 'portrait' | 'landscape',
        layout_config: (data.layout_config && typeof data.layout_config === 'object') 
          ? data.layout_config as Record<string, any>
          : {}
      };
      
      return typedTemplate;
    } catch (error) {
      console.error('Error fetching CV template:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    isCreating,
    isUpdating,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    refetch: fetchTemplates
  };
};
