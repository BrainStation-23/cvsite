
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Project } from '@/types';
import { Accordion } from '@/components/ui/accordion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { ProjectForm } from './projects/ProjectForm';
import { ProjectSearch } from './projects/ProjectSearch';
import { SortableProjectItem } from './projects/SortableProjectItem';
import { ProjectsTourButton } from './ProjectsTourButton';

interface ProjectsTabProps {
  projects: Project[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (project: Omit<Project, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, project: Partial<Project>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (projects: Project[]) => Promise<boolean>;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete,
  onReorder
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [optimisticProjects, setOptimisticProjects] = useState<Project[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use optimistic projects during reordering, otherwise use actual projects
  const displayProjects = isReordering ? optimisticProjects : projects;

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return displayProjects;
    
    const query = searchQuery.toLowerCase();
    return displayProjects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      (project.technologiesUsed && project.technologiesUsed.some(tech => 
        tech.toLowerCase().includes(query)
      ))
    );
  }, [displayProjects, searchQuery]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    // Prevent reordering while searching
    if (searchQuery) {
      console.log('Cannot reorder while searching');
      return;
    }

    console.log('Drag end - moving project:', active.id, 'to position of:', over.id);

    const oldIndex = displayProjects.findIndex(item => item.id === active.id);
    const newIndex = displayProjects.findIndex(item => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      console.error('Could not find project indices:', { oldIndex, newIndex, activeId: active.id, overId: over.id });
      return;
    }

    console.log('Moving project from index', oldIndex, 'to index', newIndex);
    
    // Optimistically update the UI immediately
    const reorderedProjects = arrayMove(displayProjects, oldIndex, newIndex);
    setOptimisticProjects(reorderedProjects);
    setIsReordering(true);
    
    try {
      console.log('Attempting to save reordered projects to database...');
      // Attempt to sync with backend
      const success = await onReorder(reorderedProjects);
      
      if (!success) {
        console.error('Failed to save reordered projects - reverting to original order');
        // If failed, revert to original order
        setOptimisticProjects(projects);
      } else {
        console.log('Successfully saved reordered projects');
      }
    } catch (error) {
      console.error('Error reordering projects:', error);
      // If error, revert to original order
      setOptimisticProjects(projects);
    } finally {
      // Reset optimistic state after backend sync
      setIsReordering(false);
      setOptimisticProjects([]);
    }
  };

  const handleStartAddNew = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Project, 'id'>) => {
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
    return success;
  };

  const handleStartEdit = (projectId: string) => {
    setEditingId(projectId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Projects</CardTitle>
            <ProjectsTourButton />
          </div>
          <div className="flex items-center space-x-2">
            <ProjectSearch 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            {isEditing && !isAdding && !editingId && (
              <Button variant="outline" onClick={handleStartAddNew} data-tour="add-project-button">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6">
            <ProjectForm
              isSaving={isSaving}
              onSave={handleSaveNew}
              onCancel={handleCancelAdd}
            />
          </div>
        )}
        
        {searchQuery && (
          <div className="mb-4 text-sm text-amber-600 dark:text-amber-400">
            Drag-and-drop reordering is disabled while searching. Clear the search to reorder projects.
          </div>
        )}
        
        {isReordering && (
          <div className="mb-4 text-sm text-blue-600 dark:text-blue-400">
            Saving project order...
          </div>
        )}
        
        {filteredProjects.length > 0 ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filteredProjects.map(p => p.id)} 
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {filteredProjects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    isEditing={isEditing && !searchQuery}
                    isSaving={isSaving}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    editingId={editingId}
                    onStartEdit={() => handleStartEdit(project.id)}
                    onCancelEdit={handleCancelEdit}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchQuery ? 'No projects found matching your search.' : 'No projects added yet.'}
            {isEditing && !searchQuery && ' Click "Add Project" to add projects you\'ve worked on.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
