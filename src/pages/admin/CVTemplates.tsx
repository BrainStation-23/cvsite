
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Copy, Trash2, Eye, FileText } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { CVTemplate } from '@/types/cv-templates';

const CVTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { templates, isLoading, deleteTemplate } = useCVTemplates();

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };

  const handleCreateTemplate = () => {
    navigate('/admin/cv-templates/create');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center py-4 px-1 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">CV Templates</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and create CV templates</p>
          </div>
          <Button 
            onClick={handleCreateTemplate}
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 py-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm">Create your first CV template to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium truncate">{template.name}</CardTitle>
                        {template.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                        )}
                      </div>
                      <Badge variant={template.is_active ? "default" : "secondary"} className="ml-2">
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{template.pages_count} page{template.pages_count !== 1 ? 's' : ''}</span>
                      <span className="capitalize">{template.orientation}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/admin/cv-templates/${template.id}/preview`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/cv-templates/${template.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {/* TODO: Implement duplicate */}}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplates;
