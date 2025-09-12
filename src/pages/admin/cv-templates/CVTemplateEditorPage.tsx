import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Eye, FileText, Database } from 'lucide-react';
import { toast } from 'sonner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplateHTMLEditor } from '@/components/admin/cv-templates/CVTemplateHTMLEditor';
import { TemplateVariableHelper } from '@/components/admin/cv-templates/TemplateVariableHelper';
import { LimitConfigurationSection } from '@/components/admin/cv-templates/LimitConfigurationSection';
import { EXAMPLE_CV_TEMPLATE } from '@/constants/cv-template-examples';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Available data sources
const AVAILABLE_DATA_SOURCES = [
  { value: 'get_employee_data_masked', label: 'Employee Data (Masked)' },
  { value: 'get_employee_data', label: 'Employee Data (Full)' },
];

const CVTemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, updateTemplate, isUpdating } = useCVTemplates();
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();
  
  const [templateName, setTemplateName] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [dataSourceFunction, setDataSourceFunction] = useState('get_employee_data_masked');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [limits, setLimits] = useState({
    technicalSkillsLimit: 5,
    specializedSkillsLimit: 5,
    experiencesLimit: 5,
    educationLimit: 5,
    trainingsLimit: 5,
    achievementsLimit: 5,
    projectsLimit: 5,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentTemplate = templates.find(t => t.id === id);

  useEffect(() => {
    if (currentTemplate) {
      setTemplateName(currentTemplate.name);
      setHtmlTemplate(currentTemplate.html_template);
      setDataSourceFunction(currentTemplate.data_source_function);
      setOrientation(currentTemplate.orientation);
      setLimits({
        technicalSkillsLimit: currentTemplate.technical_skills_limit,
        specializedSkillsLimit: currentTemplate.specialized_skills_limit,
        experiencesLimit: currentTemplate.experiences_limit,
        educationLimit: currentTemplate.education_limit,
        trainingsLimit: currentTemplate.trainings_limit,
        achievementsLimit: currentTemplate.achievements_limit,
        projectsLimit: currentTemplate.projects_limit,
      });
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
      data_source_function: dataSourceFunction,
      orientation,
      technical_skills_limit: limits.technicalSkillsLimit,
      specialized_skills_limit: limits.specializedSkillsLimit,
      experiences_limit: limits.experiencesLimit,
      education_limit: limits.educationLimit,
      trainings_limit: limits.trainingsLimit,
      achievements_limit: limits.achievementsLimit,
      projects_limit: limits.projectsLimit,
    });
    
    setHasUnsavedChanges(false);
    toast.success('Template saved successfully');
  };

  const handleLimitChange = (field: string, value: number) => {
    setLimits(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
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

  const handleDataSourceChange = (value: string) => {
    setDataSourceFunction(value);
    setHasUnsavedChanges(true);
  };

  const handleOrientationChange = (value: 'portrait' | 'landscape') => {
    setOrientation(value);
    setHasUnsavedChanges(true);
  };

  if (!currentTemplate) {
    return (

        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Template not found</div>
        </div>
    );
  }

  return (
    <div>
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

        {/* Template Configuration */}
        <div className="p-4 border-b bg-muted/30 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_source" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Source
              </Label>
              <Select value={dataSourceFunction} onValueChange={handleDataSourceChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_DATA_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Orientation
              </Label>
              <RadioGroup 
                value={orientation} 
                onValueChange={handleOrientationChange}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Data Limits Configuration */}
          <LimitConfigurationSection
            limits={limits}
            onLimitChange={handleLimitChange}
            disabled={isUpdating}
          />
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
    </div>
  );
};

export default CVTemplateEditorPage;
