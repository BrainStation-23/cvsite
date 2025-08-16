
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplateHTMLEditor } from '@/components/admin/cv-templates/CVTemplateHTMLEditor';
import { TemplateVariableHelper } from '@/components/admin/cv-templates/TemplateVariableHelper';
import { EXAMPLE_CV_TEMPLATE } from '@/constants/cv-template-examples';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

const CVTemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, updateTemplate, isUpdating } = useCVTemplates();
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();
  
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
      showConfirmation({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes. Are you sure you want to leave?',
        confirmText: 'Leave',
        cancelText: 'Stay',
        variant: 'destructive',
        onConfirm: () => navigate('/admin/cv-templates')
      });
    } else {
      navigate('/admin/cv-templates');
    }
  };

  const handlePreview = () => {
    navigate(`/admin/cv-templates/${id}`);
  };

  const handleInsertExample = (exampleHTML: string) => {
    if (hasUnsavedChanges) {
      showConfirmation({
        title: 'Replace Current Template',
        description: 'This will replace your current template. Are you sure?',
        confirmText: 'Replace',
        cancelText: 'Cancel',
        variant: 'destructive',
        onConfirm: () => {
          setHtmlTemplate(exampleHTML);
          setHasUnsavedChanges(true);
          toast.success('Example template inserted');
        }
      });
    } else {
      setHtmlTemplate(exampleHTML);
      setHasUnsavedChanges(true);
      toast.success('Example template inserted');
    }
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
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
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
            <Button variant="outline" onClick={() => handleInsertExample(EXAMPLE_CV_TEMPLATE)}>
              <FileText className="h-4 w-4 mr-2" />
              Insert Example
            </Button>
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

        {/* Main Content - Two Panel Layout */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel - HTML Editor */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <CVTemplateHTMLEditor
                value={htmlTemplate}
                onChange={handleTemplateChange}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Template Helper */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <TemplateVariableHelper
                selectedEmployeeId={null}
                onInsertExample={handleInsertExample}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Confirmation Dialog */}
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
    </DashboardLayout>
  );
};

export default CVTemplateEditorPage;
