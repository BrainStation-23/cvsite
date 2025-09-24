import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModuleForm } from '@/components/admin/modules/ModuleForm';
import { useModule, useUpdateModule } from '@/hooks/rbac/useModules';
import { Module } from '@/types';

const EditModule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: module, isLoading, error } = useModule(id!);
  const updateModule = useUpdateModule();

  const handleSubmit = async (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => {
    if (!id) return;
    
    try {
      await updateModule.mutateAsync({
        id,
        updates: moduleData
      });
      navigate('/admin/modules');
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading module...</div>;
  }

  if (error || !module) {
    return <div className="text-destructive">Error loading module</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/modules">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Edit Module</h1>
              <p className="text-sm text-muted-foreground">
                Configure module settings and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Module Configuration</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update the module details and settings below
              </p>
            </div>
            <div className="p-6">
              <ModuleForm
                module={module}
                onSubmit={handleSubmit}
                loading={updateModule.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModule;