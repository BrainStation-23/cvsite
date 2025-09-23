import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SubModuleForm } from '@/components/admin/modules/SubModuleForm';
import { useCreateSubModule, useModule } from '@/hooks/rbac/useModules';
import { SubModule } from '@/types';

const CreateSubModule: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const createSubModule = useCreateSubModule();
  const { data: module } = useModule(moduleId!);

  const handleSubmit = async (subModuleData: Omit<SubModule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createSubModule.mutateAsync(subModuleData);
      navigate(`/admin/modules/${moduleId}/submodules`);
    } catch (error) {
      console.error('Error creating sub-module:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/modules/${moduleId}/submodules`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sub-modules
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Sub-module</h1>
          <p className="text-muted-foreground">
            Add a new sub-module to {module?.name || 'the module'}
          </p>
        </div>
      </div>

      <div className="w-full">
        <SubModuleForm
          moduleId={moduleId!}
          onSubmit={handleSubmit}
          loading={createSubModule.isPending}
        />
      </div>
    </div>
  );
};

export default CreateSubModule;