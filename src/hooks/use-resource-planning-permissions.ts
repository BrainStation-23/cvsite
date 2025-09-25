import { usePermissionUI } from './use-permission-ui';

export const useResourcePlanningPermissions = () => {
  return usePermissionUI({
    moduleId: 'Resource Calendar',
    subModuleId: 'Planning',
    permissions: ['create', 'read', 'update', 'delete']
  });
};