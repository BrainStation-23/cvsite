import { supabase } from '@/integrations/supabase/client';
import { CustomRole } from '@/types';

export class RoleService {
  static async getAllRoles(): Promise<CustomRole[]> {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createRole(roleData: Omit<CustomRole, 'id' | 'created_at' | 'updated_at'>): Promise<CustomRole> {
    const { data, error } = await supabase
      .from('custom_roles')
      .insert([roleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateRole(id: string, updates: Partial<CustomRole>): Promise<CustomRole> {
    const { data, error } = await supabase
      .from('custom_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_roles')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  static async getRoleById(id: string): Promise<CustomRole | null> {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}