
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldDisplayConfig {
  id: string;
  field_name: string;
  section_type: string;
  display_label: string;
  default_enabled: boolean;
  default_masked: boolean;
  default_mask_value?: string;
  default_order: number;
  field_type: string;
  is_system_field: boolean;
}

interface NewFieldConfig {
  field_name: string;
  section_type: string;
  display_label: string;
  default_enabled: boolean;
  default_masked: boolean;
  default_order: number;
  field_type: string;
  is_system_field: boolean;
  default_mask_value: string;
}

export const useFieldDisplayConfig = () => {
  const [configs, setConfigs] = useState<FieldDisplayConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<FieldDisplayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'field_name' | 'section_type' | 'display_label' | 'default_order'>('section_type');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  const loadConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_field_display_config')
        .select('*')
        .order('section_type', { ascending: true })
        .order('default_order', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading field display configs:', error);
      toast({
        title: "Error",
        description: "Failed to load field display configurations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filter and sort configs based on search and sort criteria
  useEffect(() => {
    let filtered = configs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = configs.filter(config =>
        config.field_name.toLowerCase().includes(query) ||
        config.section_type.toLowerCase().includes(query) ||
        config.display_label.toLowerCase().includes(query) ||
        config.field_type.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });

    setFilteredConfigs(filtered);
  }, [configs, searchQuery, sortBy, sortOrder]);

  const saveConfig = async (config: FieldDisplayConfig): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cv_field_display_config')
        .update({
          field_name: config.field_name,
          section_type: config.section_type,
          display_label: config.display_label,
          default_enabled: config.default_enabled,
          default_masked: config.default_masked,
          default_mask_value: config.default_mask_value,
          default_order: config.default_order,
          field_type: config.field_type,
          is_system_field: config.is_system_field
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field configuration updated successfully"
      });
      await loadConfigs();
      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update field configuration",
        variant: "destructive"
      });
      return false;
    }
  };

  const addConfig = async (newConfig: NewFieldConfig): Promise<boolean> => {
    try {
      // Validate required fields
      if (!newConfig.field_name.trim() || !newConfig.display_label.trim()) {
        toast({
          title: "Error",
          description: "Field name and display label are required",
          variant: "destructive"
        });
        return false;
      }

      const configToInsert = {
        field_name: newConfig.field_name,
        section_type: newConfig.section_type,
        display_label: newConfig.display_label,
        default_enabled: newConfig.default_enabled,
        default_masked: newConfig.default_masked,
        default_order: newConfig.default_order,
        field_type: newConfig.field_type,
        is_system_field: newConfig.is_system_field,
        default_mask_value: newConfig.default_mask_value || null
      };

      const { error } = await supabase
        .from('cv_field_display_config')
        .insert(configToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field configuration added successfully"
      });
      await loadConfigs();
      return true;
    } catch (error) {
      console.error('Error adding config:', error);
      toast({
        title: "Error",
        description: "Failed to add field configuration",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteConfig = async (id: string): Promise<boolean> => {
    if (!window.confirm('Are you sure you want to delete this field configuration?')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('cv_field_display_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field configuration deleted successfully"
      });
      await loadConfigs();
      return true;
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Error",
        description: "Failed to delete field configuration",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs: filteredConfigs,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    saveConfig,
    addConfig,
    deleteConfig,
    refetch: loadConfigs
  };
};
