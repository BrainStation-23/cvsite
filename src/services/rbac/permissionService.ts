import { supabase } from '@/integrations/supabase/client';
import { RolePermission, PermissionType } from '@/types';
import { Database } from '@/integrations/supabase/types';

// Type aliases for better readability
type RolePermissionRow = Database['public']['Tables']['role_permissions']['Row'];
type RolePermissionInsert = Database['public']['Tables']['role_permissions']['Insert'];
type PermissionTypeRow = Database['public']['Tables']['permission_types']['Row'];

export class PermissionService {
  static async getRolePermissions(roleId: string): Promise<RolePermissionRow[]> {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_id', roleId);

    if (error) throw error;
    return data || [];
  }

  static async assignPermission(permission: RolePermissionInsert): Promise<RolePermissionRow> {
    const { data, error } = await supabase
      .from('role_permissions')
      .insert([permission])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removePermission(id: string): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getPermissionTypes(): Promise<PermissionTypeRow[]> {
    const { data, error } = await supabase
      .from('permission_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async updateRolePermissions(roleId: string, permissions: RolePermissionInsert[]): Promise<void> {
    // Remove existing permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) throw deleteError;

    // Add new permissions
    if (permissions.length > 0) {
      const permissionsWithRoleId = permissions.map(p => ({ ...p, role_id: roleId }));
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsWithRoleId);

      if (insertError) throw insertError;
    }
  }
}