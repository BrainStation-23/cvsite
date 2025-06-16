
import { useProjects } from './use-projects';

export function useProfileProjects(profileId?: string) {
  const {
    projects,
    isLoading,
    isSaving,
    saveProject,
    updateProject,
    deleteProject,
    reorderProjects
  } = useProjects(profileId);

  return {
    projects,
    isLoading,
    isSaving,
    saveProject,
    updateProject,
    deleteProject,
    reorderProjects
  };
}
