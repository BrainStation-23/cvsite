import { supabase } from '@/integrations/supabase/client';
import { Module, SubModule, SBU } from '@/types';

export class ModuleService {
  static async getAllModules(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  static async getSubModules(moduleId?: string): Promise<SubModule[]> {
    let query = supabase
      .from('sub_modules')
      .select('*')
      .eq('is_active', true);

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query.order('display_order');

    if (error) throw error;
    return data || [];
  }

  static async getModulesWithSubModules(): Promise<(Module & { sub_modules: SubModule[] })[]> {
    const { data, error } = await supabase
      .from('modules')
      .select(`
        *,
        sub_modules!inner(*)
      `)
      .eq('is_active', true)
      .eq('sub_modules.is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
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