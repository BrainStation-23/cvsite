
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVOrientation, CVTemplate } from '@/types/cv-templates';
import TemplateBuilder from '@/components/admin/cv-templates/TemplateBuilder';
import EnhancedSectionManager from '@/components/admin/cv-templates/EnhancedSectionManager';
import { useToast } from '@/hooks/use-toast';

interface EditTemplateForm {
  name: string;
  description: string;
  pages_count: number;
  orientation: CVOrientation;
  is_active: boolean;
}

const CVTemplateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate, isUpdating } = useCVTemplates();
  const [template, setTemplate] = useState<CVTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditTemplateForm>();

  const loadTemplate = async () => {
    if (id) {
      const templateData = await getTemplate(id);
      if (templateData) {
        setTemplate(templateData);
        if (!isFormInitialized) {
          setValue('name', templateData.name);
          setValue('description', templateData.description || '');
          setValue('pages_count', templateData.pages_count);
          setValue('orientation', templateData.orientation);
          setValue('is_active', templateData.is_active);
          setIsFormInitialized(true);
        }
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [id, getTemplate]);

  useEffect(() => {
    if (!isFormInitialized) return;
    
    const subscription = watch((value, { name, type }) => {
      if (template && type === 'change') {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, template, isFormInitialized]);

  const onSubmit = async (data: EditTemplateForm) => {
    if (id && template) {
      const success = await updateTemplate(id, {
        ...data,
        layout_config: template.layout_config || {}
      });
      
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

  const handleLayoutUpdate = (layoutConfig: Record<string, any>) => {
    if (template) {
      setTemplate(prev => ({
        ...prev!,
        layout_config: layoutConfig
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveAll = async () => {
    const formData = watch();
    await onSubmit(formData);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/admin/cv-templates');
  };

  const handlePreview = () => {
    navigate(`/admin/cv-templates/${id}/preview`);
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
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
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

        {/* Content */}
        <div className="flex-1 min-h-0 py-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="sections">Sections & Fields</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        {...register('name', { required: 'Template name is required' })}
                        placeholder="Enter template name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe this template"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pages_count">Number of Pages</Label>
                        <Select 
                          value={String(watch('pages_count'))} 
                          onValueChange={(value) => {
                            setValue('pages_count', parseInt(value));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Page</SelectItem>
                            <SelectItem value="2">2 Pages</SelectItem>
                            <SelectItem value="3">3 Pages</SelectItem>
                            <SelectItem value="4">4 Pages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <Select 
                          value={watch('orientation')} 
                          onValueChange={(value: CVOrientation) => {
                            setValue('orientation', value);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={watch('is_active')}
                        onCheckedChange={(checked) => {
                          setValue('is_active', checked);
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <Label htmlFor="is_active">Active Template</Label>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout">
              <TemplateBuilder 
                template={template} 
                onLayoutUpdate={handleLayoutUpdate}
              />
            </TabsContent>

            <TabsContent value="sections">
              <EnhancedSectionManager 
                templateId={id!} 
                onSectionsChange={() => setHasUnsavedChanges(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateEdit;
