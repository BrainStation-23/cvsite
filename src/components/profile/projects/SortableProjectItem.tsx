
import React from 'react';
import { AccordionItem } from '@/components/ui/accordion';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project } from '@/types';
import { ProjectDisplay } from './ProjectDisplay';
import { ProjectForm } from './ProjectForm';

interface SortableProjectItemProps {
  project: Project;
  isEditing: boolean;
  isSaving: boolean;
  onUpdate: (id: string, project: Partial<Project>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  editingId: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export const SortableProjectItem: React.FC<SortableProjectItemProps> = ({
  project,
  isEditing,
  isSaving,
  onUpdate,
  onDelete,
  editingId,
  onStartEdit,
  onCancelEdit
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = async (data: any) => {
    const success = await onUpdate(project.id, data);
    if (success) {
      onCancelEdit();
    }
    return success;
  };

  const handleDelete = async () => {
    return await onDelete(project.id);
  };

  const isCurrentlyEditing = editingId === project.id;

  // Convert Project to ProjectExperience format for the form
  const projectExperience = {
    id: project.id,
    projectName: project.name,
    clientName: '', // This would need to be added to Project type if needed
    role: project.role,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    isCurrent: project.isCurrent
  };

  return (
    <AccordionItem 
      ref={setNodeRef} 
      style={style} 
      value={project.id} 
      className="border rounded-md p-4"
    >
      {isCurrentlyEditing ? (
        <ProjectForm
          initialData={projectExperience}
          isSaving={isSaving}
          onSave={handleSaveEdit}
          onCancel={onCancelEdit}
        />
      ) : (
        <ProjectDisplay
          project={project}
          isEditing={isEditing}
          onEdit={onStartEdit}
          onDelete={handleDelete}
        >
          {isEditing && (
            <div 
              {...attributes} 
              {...listeners}
              className="flex items-center cursor-grab active:cursor-grabbing mr-3"
              data-testid="drag-handle"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </ProjectDisplay>
      )}
    </AccordionItem>
  );
};
