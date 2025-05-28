
import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVOrientation } from '@/types/cv-templates';

interface CreateTemplateForm {
  name: string;
  description: string;
  pages_count: number;
  orientation: CVOrientation;
  is_active: boolean;
}

const CVTemplateCreate: React.FC = () => {
  const { createTemplate, isCreating } = useCVTemplates();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTemplateForm>({
    defaultValues: {
      name: '',
      description: '',
      pages_count: 1,
      orientation: 'portrait',
      is_active: true
    }
  });

  const watchedOrientation = watch('orientation');
  const watchedIsActive = watch('is_active');

  const onSubmit = async (data: CreateTemplateForm) => {
    const success = await createTemplate({
      ...data,
      layout_config: {}
    });
    
    if (success) {
      window.location.href = '/admin/cv-templates';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-4 py-4 px-1 border-b border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/admin/cv-templates'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">Create CV Template</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Design a new CV template</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 py-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        value={watchedOrientation} 
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
                      checked={watchedIsActive}
                      onCheckedChange={(checked) => setValue('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Active Template</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/cv-templates'}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateCreate;
