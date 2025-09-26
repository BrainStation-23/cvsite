import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModuleForm } from '@/components/admin/modules/ModuleForm';
import { useCreateModule } from '@/hooks/rbac/useModules';
import type { Module } from '@/types';

const CreateModule: React.FC = () => {
  const navigate = useNavigate();
  const createModule = useCreateModule();

  const handleSubmit = async (
    moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      await createModule.mutateAsync(moduleData);
      navigate('/admin/modules');
    } catch (error) {
      // Error is shown inline below as well
      console.error('Error creating module:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
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
              <h1 className="text-2xl font-semibold">Create Module</h1>
              <p className="text-sm text-muted-foreground">
                Add a new module for navigation and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Module Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Provide the information below to create a new module
              </p>
            </div>
            <div className="p-6">
              {/* Inline error (if any) */}
              {createModule.isError && (
                <div className="mb-4 text-sm text-destructive">
                  {(createModule.error as Error)?.message || 'Failed to create module.'}
                </div>
              )}

              <ModuleForm
                onSubmit={handleSubmit}
                loading={createModule.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModule;
