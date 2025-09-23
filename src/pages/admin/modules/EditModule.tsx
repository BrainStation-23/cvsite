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
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/modules">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Module</h1>
          <p className="text-muted-foreground">
            Modify module configuration and settings
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ModuleForm
          module={module}
          onSubmit={handleSubmit}
          loading={updateModule.isPending}
        />
      </div>
    </div>
  );
};

export default EditModule;