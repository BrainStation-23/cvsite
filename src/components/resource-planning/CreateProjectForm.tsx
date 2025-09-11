import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProjectTypeCombobox } from '@/components/projects/ProjectTypeCombobox';
import ProjectBillTypeCombobox from '@/components/resource-planning/ProjectBillTypeCombobox';
import ProjectLevelCombobox from '@/components/resource-planning/ProjectLevelCombobox';
import { useProjectCreation } from '@/hooks/useProjectCreation';

interface CreateProjectFormProps {
  initialProjectName?: string;
  onProjectCreated: (projectId: string, projectData: any) => void;
  onCancel: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  initialProjectName = '',
  onProjectCreated,
  onCancel
}) => {
  const {
    formData,
    isCreating,
    isFormValid,
    updateFormField,
    setProjectName,
    createProject,
    handleCancel
  } = useProjectCreation({
    onProjectCreated,
    onCancel
  });

  // Set initial project name when component mounts or initialProjectName changes
  React.useEffect(() => {
    if (initialProjectName && !formData.project_name) {
      setProjectName(initialProjectName);
    }
  }, [initialProjectName, formData.project_name, setProjectName]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isCreating}
          className="p-1 h-6 w-6"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm">Create New Forecasted Project</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="project-name" className="text-xs">Project Name *</Label>
          <Input
            id="project-name"
            value={formData.project_name}
            onChange={(e) => updateFormField('project_name', e.target.value)}
            placeholder="Enter project name"
            className="h-8 text-sm"
            disabled={isCreating}
          />
        </div>

        <div>
          <Label htmlFor="project-level" className="text-xs">Project Level *</Label>
          <ProjectLevelCombobox
            value={formData.project_level}
            onValueChange={(value) => updateFormField('project_level', value)}
            placeholder="Select level"
            disabled={isCreating}
          />
        </div>

        <div>
          <Label htmlFor="project-bill-type" className="text-xs">Project Bill Type *</Label>
          <ProjectBillTypeCombobox
            value={formData.project_bill_type}
            onValueChange={(value) => updateFormField('project_bill_type', value)}
            placeholder="Select bill type"
            disabled={isCreating}
          />
        </div>

        <div>
          <Label htmlFor="project-type" className="text-xs">Project Type *</Label>
          <ProjectTypeCombobox
            value={formData.project_type}
            onValueChange={(value) => updateFormField('project_type', value)}
            placeholder="Select type"
            disabled={isCreating}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          disabled={isCreating}
          className="flex-1 h-8 text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={createProject}
          size="sm"
          disabled={isCreating || !isFormValid}
          className="flex-1 h-8 text-xs"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </div>
  );
};