
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplate } from '@/types/cv-templates';
import LivePreviewLayout from '@/components/admin/cv-templates/LivePreviewLayout';
import TemplateEditorLayout from '@/components/admin/cv-templates/TemplateEditorLayout';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import { useEmployeeProfile } from '@/hooks/use-employee-profile';
import { useToast } from '@/hooks/use-toast';

const CVTemplateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate, isUpdating } = useCVTemplates();
  const { profiles, fetchProfiles } = useEmployeeProfiles();
  const [template, setTemplate] = useState<CVTemplate | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Fetch detailed profile data for the selected profile
  const {
    isLoading: profileLoading,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  } = useEmployeeProfile(selectedProfileId);

  // Construct the full profile object for the CV preview
  const selectedProfile = selectedProfileId ? {
    id: selectedProfileId,
    first_name: generalInfo.firstName,
    last_name: generalInfo.lastName,
    biography: generalInfo.biography,
    profile_image: generalInfo.profileImage,
    technical_skills: technicalSkills,
    specialized_skills: specializedSkills,
    experiences: experiences,
    education: education,
    trainings: trainings,
    achievements: achievements,
    projects: projects
  } : null;

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
    <TemplateEditorLayout
      templateName={template.name}
      hasUnsavedChanges={hasUnsavedChanges}
      isSaving={isUpdating}
      onBack={handleBack}
      onSave={handleSaveAll}
    >
      <LivePreviewLayout
        template={template}
        selectedProfile={selectedProfile}
        onTemplateUpdate={handleTemplateUpdate}
        onSectionsChange={handleSectionsChange}
        selectedProfileId={selectedProfileId}
        onProfileChange={handleProfileChange}
        profiles={profiles || []}
      />
    </TemplateEditorLayout>
  );
};

export default CVTemplateEdit;
