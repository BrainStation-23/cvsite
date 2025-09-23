import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SubModuleForm } from '@/components/admin/modules/SubModuleForm';
import { useSubModule, useUpdateSubModule, useModule } from '@/hooks/rbac/useModules';
import { SubModule } from '@/types';

const EditSubModule: React.FC = () => {
  const { moduleId, id } = useParams<{ moduleId: string; id: string }>();
  const navigate = useNavigate();
  const { data: subModule, isLoading, error } = useSubModule(id!);
  const { data: module } = useModule(moduleId!);
  const updateSubModule = useUpdateSubModule();

  const handleSubmit = async (subModuleData: Omit<SubModule, 'id' | 'created_at' | 'updated_at'>) => {
    if (!id) return;
    
    try {
      await updateSubModule.mutateAsync({
        id,
        updates: subModuleData
      });
      navigate(`/admin/modules/${moduleId}/submodules`);
    } catch (error) {
      console.error('Error updating sub-module:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading sub-module...</div>;
  }

  if (error || !subModule) {
    return <div className="text-destructive">Error loading sub-module</div>;
  }

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
          <h1 className="text-3xl font-bold">Edit Sub-module</h1>
          <p className="text-muted-foreground">
            Modify sub-module configuration for {module?.name || 'the module'}
          </p>
        </div>
      </div>

      <div>
        <SubModuleForm
          moduleId={moduleId!}
          subModule={subModule}
          onSubmit={handleSubmit}
          loading={updateSubModule.isPending}
        />
      </div>
    </div>
  );
};

export default EditSubModule;