
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
import { ArrowLeft, Save, Eye, Plus, Trash2, GripVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVOrientation, CVSectionType } from '@/types/cv-templates';
import TemplateBuilder from '@/components/admin/cv-templates/TemplateBuilder';
import SectionManager from '@/components/admin/cv-templates/SectionManager';
import FieldMapper from '@/components/admin/cv-templates/FieldMapper';

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
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditTemplateForm>();

  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        const templateData = await getTemplate(id);
        if (templateData) {
          setTemplate(templateData);
          setValue('name', templateData.name);
          setValue('description', templateData.description || '');
          setValue('pages_count', templateData.pages_count);
          setValue('orientation', templateData.orientation);
          setValue('is_active', templateData.is_active);
        }
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, getTemplate, setValue]);

  const onSubmit = async (data: EditTemplateForm) => {
    if (id) {
      const success = await updateTemplate(id, {
        ...data,
        layout_config: template?.layout_config || {}
      });
      
      if (success) {
        navigate('/admin/cv-templates');
      }
    }
  };

  const handleBack = () => {
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
            <Button type="submit" form="template-form" disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 py-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="fields">Field Mapping</TabsTrigger>
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
                          onValueChange={(value) => setValue('pages_count', parseInt(value))}
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
                          onValueChange={(value: CVOrientation) => setValue('orientation', value)}
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
                        onCheckedChange={(checked) => setValue('is_active', checked)}
                      />
                      <Label htmlFor="is_active">Active Template</Label>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout">
              <TemplateBuilder template={template} />
            </TabsContent>

            <TabsContent value="sections">
              <SectionManager templateId={id!} />
            </TabsContent>

            <TabsContent value="fields">
              <FieldMapper templateId={id!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateEdit;
