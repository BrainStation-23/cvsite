
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplate } from '@/types/cv-templates';
import LivePreviewLayout from '@/components/admin/cv-templates/LivePreviewLayout';
import TemplateEditorLayout from '@/components/admin/cv-templates/TemplateEditorLayout';
import { useEmployeeData } from '@/hooks/use-employee-data';
import { useToast } from '@/hooks/use-toast';
import { useTemplateConfiguration } from '@/hooks/use-template-configuration';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { EnsureReferencesFieldMappings } from '@/components/admin/cv-templates/sections/EnsureReferencesFieldMappings';

const CVTemplateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate, isUpdating } = useCVTemplates();
  const [template, setTemplate] = useState<CVTemplate | null>(null);
  const [originalTemplate, setOriginalTemplate] = useState<CVTemplate | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  
  // Add confirmation dialog hook
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  // Fetch employee data using the new RPC function
  const {
    data: selectedProfile,
    isLoading: profileLoading
  } = useEmployeeData(selectedProfileId);

  // Get template configuration for export
  const { sections: templateSections, fieldMappings: templateFieldMappings } = useTemplateConfiguration(id || '');

  const loadTemplate = async () => {
    if (id) {
      const templateData = await getTemplate(id);
      if (templateData) {
        setTemplate(templateData);
        setOriginalTemplate(templateData);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const handleTemplateUpdate = (updates: Partial<CVTemplate>) => {
    if (template) {
      setTemplate(prev => ({ ...prev!, ...updates }));
      setHasUnsavedChanges(true);
    }
  };

  const handleProfileChange = (profileId: string) => {
    console.log('Profile changed to:', profileId);
    setSelectedProfileId(profileId);
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
          setOriginalTemplate(updatedTemplate);
        }
      }
    }
  };

  const handleDiscardChanges = () => {
    if (originalTemplate) {
      setTemplate({ ...originalTemplate });
      setHasUnsavedChanges(false);
      toast({
        title: "Changes Discarded",
        description: "Template reverted to last saved state"
      });
    }
  };

  const handleSectionsChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      showConfirmation({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.',
        confirmText: 'Leave',
        cancelText: 'Stay',
        variant: 'destructive',
        onConfirm: () => navigate('/admin/cv-templates')
      });
    } else {
      navigate('/admin/cv-templates');
    }
  };

  const handleTemplateNameChange = (name: string) => {
    if (template) {
      setTemplate(prev => ({ ...prev!, name }));
      setHasUnsavedChanges(true);
    }
  };

  const handleExport = () => {
    // Export will now be handled by the ExportDropdown component
    console.log('Export triggered from template editor');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cvsite-navy"></div>
        <p className="ml-3">Loading template...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Template not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Ensure references field mappings exist */}
      {id && <EnsureReferencesFieldMappings templateId={id} />}
      
      <TemplateEditorLayout
        templateName={template.name}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isUpdating}
        onBack={handleBack}
        onSave={handleSaveAll}
        onDiscard={handleDiscardChanges}
        onTemplateNameChange={handleTemplateNameChange}
        selectedProfileId={selectedProfileId}
        onProfileChange={handleProfileChange}
        onExport={handleExport}
        // Pass the template sections and field mappings for export
        templateSections={templateSections}
        templateFieldMappings={templateFieldMappings}
        template={template}
        selectedProfile={selectedProfile}
      >
        <LivePreviewLayout
          template={template}
          selectedProfile={selectedProfile}
          onTemplateUpdate={handleTemplateUpdate}
          onSectionsChange={handleSectionsChange}
          selectedProfileId={selectedProfileId}
          onProfileChange={handleProfileChange}
        />
      </TemplateEditorLayout>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};

export default CVTemplateEdit;
