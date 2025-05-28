
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplate } from '@/types/cv-templates';
import LivePreviewLayout from '@/components/admin/cv-templates/LivePreviewLayout';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import { useToast } from '@/hooks/use-toast';

interface EditTemplateForm {
  name: string;
  description: string;
  pages_count: number;
  orientation: 'portrait' | 'landscape';
  is_active: boolean;
}

const CVTemplateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate, isUpdating } = useCVTemplates();
  const { profiles, fetchProfiles } = useEmployeeProfiles();
  const [template, setTemplate] = useState<CVTemplate | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const loadTemplate = async () => {
    if (id) {
      const templateData = await getTemplate(id);
      if (templateData) {
        setTemplate(templateData);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
    fetchProfiles();
  }, [id]);

  useEffect(() => {
    if (selectedProfileId && profiles) {
      const profile = profiles.find(p => p.id === selectedProfileId);
      setSelectedProfile(profile || null);
    }
  }, [selectedProfileId, profiles]);

  const handleTemplateUpdate = (updates: Partial<CVTemplate>) => {
    if (template) {
      setTemplate(prev => ({ ...prev!, ...updates }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveAll = async () => {
    if (id && template) {
      const success = await updateTemplate(id, template);
      
      if (success) {
        setHasUnsavedChanges(false);
        toast({
          title: "Success",
          description: "Template saved successfully"
        });
        const updatedTemplate = await getTemplate(id);
        if (updatedTemplate) {
          setTemplate(updatedTemplate);
        }
      }
    }
  };

  const handleSectionsChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/admin/cv-templates');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading template...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Template not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between py-4 px-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">Edit Template</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{template.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveAll} 
              disabled={isUpdating}
              className={hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Saving...' : hasUnsavedChanges ? 'Save Changes *' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-3">
            <p className="text-sm text-orange-700">You have unsaved changes</p>
          </div>
        )}

        {/* Live Preview + Inspector Layout */}
        <div className="flex-1 min-h-0">
          <LivePreviewLayout
            template={template}
            selectedProfile={selectedProfile}
            onTemplateUpdate={handleTemplateUpdate}
            onSectionsChange={handleSectionsChange}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateEdit;
