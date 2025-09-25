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
    
    // Create permissions
    canCreate: hasPermission('create'),
    showCreateButton: hasPermission('create'),
    showDuplicateButton: hasPermission('create'),
    
    // Update permissions  
    canUpdate: hasPermission('update'),
    showEditButton: hasPermission('update'),
    showCompleteButton: hasPermission('update'),
    showInvalidateButton: hasPermission('update'),
    showBulkUpdateButton: hasPermission('update'),
    
    // Delete permissions
    canDelete: hasPermission('delete'),
    showDeleteButton: hasPermission('delete'),
    
    // Combined permissions
    hasAnyPermission: config.permissions.some(p => hasPermission(p)),
    hasAllPermissions: config.permissions.every(p => hasPermission(p)),
    
    // Specific permission checker
    hasPermission,
  };
};