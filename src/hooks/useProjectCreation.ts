import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedProjectsApiService } from '@/services/enhanced-projects-api';
import { useToast } from '@/hooks/use-toast';

interface NewProjectForm {
  project_name: string;
  project_level: string | null;
  project_bill_type: string | null;
  project_type: string | null;
}

interface UseProjectCreationProps {
  onProjectCreated: (projectId: string, projectData: any) => void;
  onCancel: () => void;
}

export const useProjectCreation = ({ onProjectCreated, onCancel }: UseProjectCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<NewProjectForm>({
    project_name: '',
    project_level: null,
    project_bill_type: null,
    project_type: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateFormField = <K extends keyof NewProjectForm>(
    field: K, 
    value: NewProjectForm[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      project_level: null,
      project_bill_type: null,
      project_type: null,
    });
  };

  const setProjectName = (name: string) => {
    setFormData(prev => ({ ...prev, project_name: name }));
  };

  const validateForm = (): boolean => {
    if (!formData.project_name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.project_level || !formData.project_bill_type || !formData.project_type) {
      toast({
        title: 'Error', 
        description: 'Project level, bill type, and type are required',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const createProject = async () => {
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      const projectData = {
        project_name: formData.project_name.trim(),
        project_level: formData.project_level,
        project_bill_type: formData.project_bill_type,
        project_type: formData.project_type,
        forecasted: true,
        is_active: true,
        client_name: null,
        project_manager: null,
        budget: null,
        description: null,
      };

      await EnhancedProjectsApiService.createProject(projectData);

      // Refresh project lists
      await queryClient.invalidateQueries({ queryKey: ['projects-search'] });
      await queryClient.invalidateQueries({ queryKey: ['selected-project'] });

      // Get the newly created project to select it
      const { data: newProjects } = await supabase
        .from('projects_management')
        .select(`
          id, 
          project_name, 
          client_name, 
          project_level, 
          project_bill_type, 
          forecasted,
          project_type:project_types(name)
        `)
        .eq('project_name', projectData.project_name)
        .eq('forecasted', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (newProjects && newProjects.length > 0) {
        const newProject = {
          ...newProjects[0],
          project_type_name: newProjects[0].project_type?.name || null
        };
        onProjectCreated(newProject.id, newProject);
      }

      toast({
        title: 'Success',
        description: 'Forecasted project created successfully'
      });

      resetForm();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const isFormValid = formData.project_name.trim() && 
                     formData.project_level && 
                     formData.project_bill_type && 
                     formData.project_type;

  return {
    formData,
    isCreating,
    isFormValid,
    updateFormField,
    setProjectName,
    createProject,
    handleCancel,
    resetForm
  };
};