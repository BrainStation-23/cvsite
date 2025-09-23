import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModuleForm } from '@/components/admin/modules/ModuleForm';
import { useCreateModule } from '@/hooks/rbac/useModules';
import { Module } from '@/types';

const CreateModule: React.FC = () => {
  const navigate = useNavigate();
  const createModule = useCreateModule();

  const handleSubmit = async (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createModule.mutateAsync(moduleData);
      navigate('/admin/modules');
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

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
          <h1 className="text-3xl font-bold">Create New Module</h1>
          <p className="text-muted-foreground">
            Add a new module to the system for navigation and permissions
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ModuleForm
          onSubmit={handleSubmit}
          loading={createModule.isPending}
        />
      </div>
    </div>
  );
};

export default CreateModule;