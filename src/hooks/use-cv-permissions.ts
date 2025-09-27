import { usePermissionUI } from './use-permission-ui';

export const useCvSearchPermissions = () => {
  return usePermissionUI({
    moduleId: 'CV Database',
    subModuleId: 'CV Search',
    permissions: ['write', 'read', 'update', 'delete']
  });
};

export const useCvTrainingPermissions = () => {
  return usePermissionUI({
    moduleId: 'CV Database',
    subModuleId: 'Training and Certification',
    permissions: ['write', 'read', 'update', 'delete']
  });
};


export const useCvCompletionPermissions = () => {
return usePermissionUI({
    moduleId: 'CV Database',
    subModuleId: 'CV Completion',
    permissions: ['write', 'read', 'update', 'delete']
});
};

export const useCvTemplatePermissions = () => {
return usePermissionUI({
    moduleId: 'CV Database',
    subModuleId: 'CV Templates',
    permissions: ['write', 'read', 'update', 'delete']
});
};

export const useCvSettingsPermissions = () => {
return usePermissionUI({
    moduleId: 'CV Database',
    subModuleId: 'CV Settings',
    permissions: ['write', 'read', 'update', 'delete']
});
};