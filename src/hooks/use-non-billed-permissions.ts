import { usePermissionUI } from './use-permission-ui';

export const useNonBilledDashboardPermissions = () => {
  return usePermissionUI({
    moduleId: 'Non-Billed Management',
    subModuleId: 'Non-Billed Dashboard',
    permissions: ['write', 'read', 'update', 'delete']
  });
};

export const useNonBilledReportPermissions = () => {
  return usePermissionUI({
    moduleId: 'Non-Billed Management',
    subModuleId: 'Non-Billed Report',
    permissions: ['write', 'read', 'update', 'delete']
  });
};


export const useNonBilledSettingPermissions = () => {
return usePermissionUI({
    moduleId: 'Non-Billed Management',
    subModuleId: 'Non-Billed Settings',
    permissions: ['write', 'read', 'update', 'delete']
});
};