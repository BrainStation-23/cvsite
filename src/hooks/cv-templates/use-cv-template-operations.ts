import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CVTemplate } from '@/types/cv-templates';

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

export const useCVTemplateOperations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const convertSupabaseTemplate = (template: SupabaseCVTemplate): CVTemplate => ({
    ...template,
    orientation: template.orientation as 'portrait' | 'landscape',
    layout_config: (template.layout_config && typeof template.layout_config === 'object') 
      ? template.layout_config as Record<string, any>
      : {}
  });

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
      console.log('Updating template with data:', templateData);
      
      const { data, error } = await supabase
        .from('cv_templates')
        .update({
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Template update error:', error);
        throw error;
      }

      console.log('Template updated successfully:', data);

      toast({
        title: "Success",
        description: "CV template updated successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error updating CV template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update CV template",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('cv_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "CV template deleted successfully"
      });

      return true;
    } catch (error) {
      console.error('Error deleting CV template:', error);
      toast({
        title: "Error",
        description: "Failed to delete CV template",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isCreating,
    isUpdating,
    isDeleting,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    convertSupabaseTemplate
  };
};
