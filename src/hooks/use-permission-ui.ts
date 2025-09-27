import { useAuth } from '@/contexts/AuthContext';

export interface PermissionConfig {
  moduleId: string;
  subModuleId: string;
  permissions: Array<'write' | 'read' | 'update' | 'delete'>;
}

export const usePermissionUI = (config: PermissionConfig) => {
  const { hasSubModulePermission } = useAuth();
  
  const hasPermission = (permission: 'write' | 'read' | 'update' | 'delete') => {
    return hasSubModulePermission(config.subModuleId, permission);
  };

  return {
    // Read permissions
    canRead: hasPermission('read'),
    
    //Resource Planning Create permissions
    canCreate: hasPermission('write'),
    showCreateButton: hasPermission('write'),
    showDuplicateButton: hasPermission('write'),
    
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
    canCreateForecastedProject: hasPermission('write'),
    showDuplicateProjectButton: hasPermission('write'),
    
    //Non Billed permissions
    canEditFeedback: hasPermission('update'),
    canSynchNonBilledData: hasPermission('update'),
    canCreateSynchNonBilledData: hasPermission('write'),

    //CV Database permissions
    canEditCv: hasPermission('update'),
    canCreateCv: hasPermission('write'),
    canEditCvTemplate: hasPermission('update'),
    canCreateCvTemplate: hasPermission('write'),
    canDeleteCvTemplate: hasPermission('delete'),
    canPreviewCvTemplate: hasPermission('read'),

    // Specific permission checker
    hasPermission,
  };
};