
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Eye, Star, Database, FileText, Copy } from 'lucide-react';
import { useCVTemplates, CVTemplate } from '@/hooks/use-cv-templates';
import { CVTemplateForm } from '@/components/admin/cv-templates/CVTemplateForm';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';

const CVTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate, 
    duplicateTemplate,
    isCreating, 
    isUpdating, 
    isDeleting,
    isDuplicating
  } = useCVTemplates();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CVTemplate | undefined>();
  
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (template: CVTemplate) => {
    navigate(`/admin/cv-templates/${template.id}/edit`);
  };

  const handleDelete = (template: CVTemplate) => {
    showConfirmation({
      title: 'Delete CV Template',
      description: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => deleteTemplate(template.id)
    });
  };

  const handleDuplicate = (template: CVTemplate) => {
    duplicateTemplate(template.id);
  };

  const handlePreview = (template: CVTemplate) => {
    navigate(`/admin/cv-templates/${template.id}`);
  };

  const handleToggleEnabled = (template: CVTemplate) => {
    updateTemplate({ 
      id: template.id, 
      enabled: !template.enabled 
    });
  };

  const handleToggleDefault = (template: CVTemplate) => {
    updateTemplate({ 
      id: template.id, 
      is_default: !template.is_default 
    });
  };

  const handleFormSubmit = (data: { 
    name: string; 
    html_template: string; 
    enabled?: boolean; 
    is_default?: boolean;
    data_source_function?: string;
    orientation?: 'portrait' | 'landscape';
  }) => {
    if (editingTemplate) {
      updateTemplate({ id: editingTemplate.id, ...data });
    } else {
      createTemplate(data);
    }
    setIsFormOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDataSourceLabel = (functionName: string) => {
    switch (functionName) {
      case 'get_employee_data_masked':
        return 'Masked Data';
      case 'get_employee_data':
        return 'Full Data';
      default:
        return functionName;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading CV templates...</div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              CV Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage CV templates for generating customized resumes
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Templates Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>Orientation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[250px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No CV templates found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.name}</span>
                        {template.is_default && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getDataSourceLabel(template.data_source_function)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="capitalize">
                          {template.orientation}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.enabled}
                          onCheckedChange={() => handleToggleEnabled(template)}
                          disabled={isUpdating}
                        />
                        <Badge variant={template.enabled ? "default" : "secondary"}>
                          {template.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={template.is_default}
                        onCheckedChange={() => handleToggleDefault(template)}
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(template.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(template)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(template)}
                          disabled={isUpdating}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(template)}
                          disabled={isDuplicating}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(template)}
                          disabled={isDeleting || template.is_default}
                          title={template.is_default ? "Cannot delete default template" : "Delete"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Form Dialog */}
        <CVTemplateForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          template={editingTemplate}
          isLoading={isCreating || isUpdating}
        />

        {/* Confirmation Dialog */}
        {config && (
          <ConfirmationDialog
            isOpen={isOpen}
            onClose={hideConfirmation}
            onConfirm={handleConfirm}
            title={config.title}
            description={config.description}
            confirmText={config.confirmText}
            cancelText={config.cancelText}
            variant={config.variant}
          />
        )}
      </div>
    
  );
};

export default CVTemplatesPage;
