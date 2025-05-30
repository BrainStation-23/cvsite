import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, FileText } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';

const CVTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { templates, getTemplates, deleteTemplate, createTemplate, isLoading, isDeleting, isCreating, refetch } = useCVTemplates();
  const [templateCounter, setTemplateCounter] = useState(1);

  useEffect(() => {
    getTemplates();
  }, []);

  useEffect(() => {
    // Update counter based on existing templates
    if (templates && templates.length > 0) {
      const maxNumber = templates
        .filter(t => t.name.startsWith('CV Template '))
        .map(t => {
          const match = t.name.match(/CV Template (\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);
      setTemplateCounter(maxNumber + 1);
    }
  }, [templates]);

  const handleCreateTemplate = async () => {
    const templateName = `CV Template ${templateCounter}`;
    
    const success = await createTemplate({
      name: templateName,
      description: 'A professional CV template with default sections',
      orientation: 'portrait',
      is_active: true,
      layout_config: {
        layoutType: 'single-column',
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
        spacing: { section: 15, item: 8 }
      }
    });

    if (success) {
      setTemplateCounter(prev => prev + 1);
      await refetch();
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/cv-templates/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const success = await deleteTemplate(id);
      if (success) {
        await refetch();
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cvsite-navy dark:text-white">CV Templates</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage CV templates for generating employee CVs
            </p>
          </div>
          <Button onClick={handleCreateTemplate} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Template'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cvsite-navy mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading templates...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates?.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      )}
                    </div>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Orientation:</span>
                      <span className="font-medium capitalize">{template.orientation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template.id)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {templates?.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first CV template.
                </p>
                <Button onClick={handleCreateTemplate} disabled={isCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CVTemplates;
