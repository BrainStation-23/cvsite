import { usePermissionUI } from './use-permission-ui';

export const useResourcePlanningPermissions = () => {
  return usePermissionUI({
    moduleId: 'Resource Calendar',
    subModuleId: 'Planning',
    permissions: ['write', 'read', 'update', 'delete']
  });
};


export const useResourceCalendarPermissions = () => {
return usePermissionUI({
    moduleId: 'Resource Calendar',
    subModuleId: 'Calendar View',
    permissions: ['write', 'read', 'update', 'delete']
});
};