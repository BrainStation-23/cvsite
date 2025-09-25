import { usePermissionUI } from './use-permission-ui';

export const useResourceCalendarPermissions = () => {
return usePermissionUI({
    moduleId: 'Resource Calendar',
    subModuleId: 'Calendar View',
    permissions: ['create', 'read', 'update', 'delete']
});
};