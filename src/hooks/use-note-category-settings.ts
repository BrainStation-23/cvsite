
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface NoteCategory {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export function useNoteCategorySettings() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isRemovingCategory, setIsRemovingCategory] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('note_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching note categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load note categories',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new category
  const addCategory = async (name: string, icon?: string) => {
    try {
      setIsAddingCategory(true);
      
      const categoryData: { name: string; icon?: string } = { name };
      if (icon) {
        categoryData.icon = icon;
      }
      
      const { data, error } = await supabase
        .from('note_categories')
        .insert(categoryData)
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Error',
            description: 'A category with this name already exists',
            variant: 'destructive'
          });
          return;
        }
        throw error;
      }
      
      setCategories(prev => [...prev, data]);
      toast({
        title: 'Success',
        description: 'Note category has been added',
      });
    } catch (error) {
      console.error('Error adding note category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note category',
        variant: 'destructive'
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Remove category
  const removeCategory = async (id: string, name: string) => {
    try {
      setIsRemovingCategory(true);
      
      const { error } = await supabase
        .from('note_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(category => category.id !== id));
      toast({
        title: 'Success',
        description: `Category "${name}" has been removed`,
      });
    } catch (error) {
      console.error('Error removing note category:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove note category',
        variant: 'destructive'
      });
    } finally {
      setIsRemovingCategory(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    isAddingCategory,
    isRemovingCategory,
    addCategory,
    removeCategory,
    refetch: fetchCategories
  };
}
