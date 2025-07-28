
import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useProjectsManagement } from '@/hooks/use-projects-management';
import { ProjectsSearchControls } from '@/components/projects/ProjectsSearchControls';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { ProjectsPagination } from '@/components/projects/ProjectsPagination';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { OdooSyncButton } from '@/components/projects/OdooSyncButton';

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ProjectsManagement: React.FC = () => {
  const {
    projects,
    pagination,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    showInactiveProjects,
    setShowInactiveProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    refetch
  } = useProjectsManagement();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleAddProject = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    showConfirmation({
      title: 'Delete Project',
      description: `Are you sure you want to delete "${project.project_name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: () => {
        deleteProject(project.id);
      }
    });
  };

  const handleToggleProjectStatus = (id: string, isActive: boolean) => {
    toggleProjectStatus(id, isActive);
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    return await createProject({
      ...projectData,
      is_active: true // New projects are active by default
    });
  };

  const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingProject) return false;
    return await updateProject(editingProject.id, projectData);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingProject(null);
  };

  // Refetch data after sync
  const handleSyncComplete = () => {
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Projects Management</h1>
          <OdooSyncButton />
        </div>
        
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <ProjectsSearchControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showInactiveProjects={showInactiveProjects}
            onShowInactiveProjectsChange={setShowInactiveProjects}
            onAddProject={handleAddProject}
          />

          <ProjectsTable
            projects={projects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onToggleStatus={handleToggleProjectStatus}
            isLoading={isLoading}
          />

          {pagination && (
            <ProjectsPagination
              currentPage={currentPage}
              totalPages={pagination.page_count}
              onPageChange={setCurrentPage}
              totalItems={pagination.filtered_count}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        <ProjectForm
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleCreateProject}
          title="Add New Project"
        />

        <ProjectForm
          isOpen={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
          onSubmit={handleUpdateProject}
          initialData={editingProject}
          title="Edit Project"
        />

        <ConfirmationDialog
          isOpen={isOpen}
          onClose={hideConfirmation}
          onConfirm={handleConfirm}
          title={config?.title || ''}
          description={config?.description || ''}
          confirmText={config?.confirmText || 'Confirm'}
          cancelText={config?.cancelText || 'Cancel'}
          variant={config?.variant || 'default'}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProjectsManagement;
