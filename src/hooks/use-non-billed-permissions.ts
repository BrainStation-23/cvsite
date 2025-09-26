import { usePermissionUI } from './use-permission-ui';

export const useNonBilledDashboardPermissions = () => {
  return usePermissionUI({
    moduleId: 'Non-Billed Management',
    subModuleId: 'Non-Billed Dashboard',
    permissions: ['create', 'read', 'update', 'delete']
  });
};

export const useNonBilledReportPermissions = () => {
  return usePermissionUI({
    moduleId: 'Non-Billed Management',
    subModuleId: 'Non-Billed Report',
    permissions: ['create', 'read', 'update', 'delete']
  });
};


export const useNonBilledSettingPermissions = () => {
return usePermissionUI({
    moduleId: 'Non-Billed Management',
    subModuleId: 'Non-Billed Settings',
    permissions: ['create', 'read', 'update', 'delete']
});
};