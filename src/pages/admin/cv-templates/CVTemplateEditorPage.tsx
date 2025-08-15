
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplateHTMLEditor } from '@/components/admin/cv-templates/CVTemplateHTMLEditor';
import { TemplateVariableHelper } from '@/components/admin/cv-templates/TemplateVariableHelper';

const CVTemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, updateTemplate, isUpdating } = useCVTemplates();
  
  const [templateName, setTemplateName] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentTemplate = templates.find(t => t.id === id);

  useEffect(() => {
    if (currentTemplate) {
      setTemplateName(currentTemplate.name);
      setHtmlTemplate(currentTemplate.html_template);
    }
  }, [currentTemplate]);

  const handleSave = () => {
    if (!id || !templateName.trim() || !htmlTemplate.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateTemplate({
      id,
      name: templateName.trim(),
      html_template: htmlTemplate.trim(),
    });
    
    setHasUnsavedChanges(false);
    toast.success('Template saved successfully');
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/admin/cv-templates');
  };

  const handlePreview = () => {
    navigate(`/admin/cv-templates/${id}`);
  };

  const handleTemplateChange = (value: string) => {
    setHtmlTemplate(value);
    setHasUnsavedChanges(true);
  };

  const handleNameChange = (value: string) => {
    setTemplateName(value);
    setHasUnsavedChanges(true);
  };

  if (!currentTemplate) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Template not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col absolute inset-0 pt-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div className="flex flex-col">
              <input
                type="text"
                value={templateName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none outline-none focus:bg-muted/50 rounded px-2 py-1"
                placeholder="Template name..."
              />
              <span className="text-sm text-muted-foreground px-2">
                Template ID: {id}
              </span>
            </div>
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>

        {/* Main Content - Fixed Height Two Panel Layout */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - HTML Editor */}
            <ResizablePanel defaultSize={60} minSize={40} className="h-full">
              <CVTemplateHTMLEditor
                value={htmlTemplate}
                onChange={handleTemplateChange}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Variable Helper */}
            <ResizablePanel defaultSize={40} minSize={30} className="h-full">
              <TemplateVariableHelper
                selectedEmployeeId={null}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateEditorPage;
