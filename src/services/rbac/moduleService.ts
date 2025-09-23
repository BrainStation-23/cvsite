import { supabase } from '@/integrations/supabase/client';
import { Module, SubModule, SBU } from '@/types';

export class ModuleService {
  // Module CRUD operations
  static async getAllModules(includeInactive = false): Promise<Module[]> {
    let query = supabase
      .from('modules')
      .select('*');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('display_order');
    if (error) throw error;
    return data || [];
  }

  static async getModuleById(id: string): Promise<Module | null> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createModule(moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateModule(id: string, updates: Partial<Module>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteModule(id: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // SubModule CRUD operations
  static async getSubModules(moduleId?: string, includeInactive = false): Promise<SubModule[]> {
    let query = supabase
      .from('sub_modules')
      .select('*');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query.order('display_order');
    if (error) throw error;
    return data || [];
  }

  static async getSubModuleById(id: string): Promise<SubModule | null> {
    const { data, error } = await supabase
      .from('sub_modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createSubModule(subModuleData: Omit<SubModule, 'id' | 'created_at' | 'updated_at'>): Promise<SubModule> {
    const { data, error } = await supabase
      .from('sub_modules')
      .insert([subModuleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSubModule(id: string, updates: Partial<SubModule>): Promise<SubModule> {
    const { data, error } = await supabase
      .from('sub_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSubModule(id: string): Promise<void> {
    const { error } = await supabase
      .from('sub_modules')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  static async getModulesWithSubModules(includeInactive = false): Promise<(Module & { sub_modules: SubModule[] })[]> {
    let query = supabase
      .from('modules')
      .select(`
        *,
        sub_modules(*)
      `);

    if (!includeInactive) {
      query = query.eq('is_active', true)
                  .eq('sub_modules.is_active', true);
    }

    const { data, error } = await query.order('display_order');
    if (error) throw error;
    return data || [];
  }

  // Table discovery and validation
  static async getAvailableTables(): Promise<string[]> {
    // This would ideally query the database schema
    // For now, we'll return common table names
    return [
      'profiles', 'projects', 'trainings', 'achievements', 'experiences', 
      'education', 'technical_skills', 'specialized_skills', 'notes',
      'resource_planning', 'projects_management', 'bill_types',
      'custom_roles', 'user_roles', 'modules', 'sub_modules'
    ];
  }

  static async getAllSBUs(): Promise<SBU[]> {
    const { data, error } = await supabase
      .from('sbus')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }
}