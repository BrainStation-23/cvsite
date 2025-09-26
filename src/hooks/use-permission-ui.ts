import { useAuth } from '@/contexts/AuthContext';

export interface PermissionConfig {
  moduleId: string;
  subModuleId: string;
  permissions: Array<'create' | 'read' | 'update' | 'delete'>;
}

export const usePermissionUI = (config: PermissionConfig) => {
  const { hasSubModulePermission } = useAuth();
  
  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    return hasSubModulePermission(config.subModuleId, permission);
  };

  return {
    // Read permissions
    canRead: hasPermission('read'),
    
    //Resource Planning Create permissions
    canCreate: hasPermission('create'),
    showCreateButton: hasPermission('create'),
    showDuplicateButton: hasPermission('create'),
    
    //Resource Planning Update permissions  
    canUpdate: hasPermission('update'),
    showEditButton: hasPermission('update'),
    showCompleteButton: hasPermission('update'),
    showInvalidateButton: hasPermission('update'),
    showBulkUpdateButton: hasPermission('update'),
    
    //Resource Planning Delete permissions
    canDelete: hasPermission('delete'),
    showDeleteButton: hasPermission('delete'),
    
    // Combined permissions
    hasAnyPermission: config.permissions.some(p => hasPermission(p)),
    hasAllPermissions: config.permissions.every(p => hasPermission(p)),

    //Resource Calendar permissions
    canEditProject: hasPermission('update'),
    canCreateForecastedProject: hasPermission('create'),
    showDuplicateProjectButton: hasPermission('create'),
    
    //Non Billed permissions
    canEditFeedback: hasPermission('update'),
    canSynchNonBilledData: hasPermission('update'),
    canCreateSynchNonBilledData: hasPermission('create'),

    //CV Database permissions
    canEditCv: hasPermission('update'),
    canCreateCv: hasPermission('create'),
    canEditCvTemplate: hasPermission('update'),
    canCreateCvTemplate: hasPermission('create'),
    canDeleteCvTemplate: hasPermission('delete'),
    canPreviewCvTemplate: hasPermission('read'),

    // Specific permission checker
    hasPermission,
  };
};