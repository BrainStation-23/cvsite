
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteCategory } from '@/types';

export function useNotes(profileId?: string) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Fetch notes for a specific profile
  const fetchNotes = async (profileId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          category:note_categories(*)
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all note categories
  const fetchCategories = async () => {
    try {
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
    }
  };

  // Add a new note
  const addNote = async (noteData: {
    profile_id: string;
    title: string;
    content?: string;
    category_id?: string;
  }) => {
    try {
      setIsAddingNote(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          created_by: user.id
        })
        .select(`
          *,
          category:note_categories(*)
        `)
        .single();
      
      if (error) throw error;
      
      setNotes(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Note has been added',
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive'
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  // Update an existing note
  const updateNote = async (noteId: string, updates: {
    title?: string;
    content?: string;
    category_id?: string;
  }) => {
    try {
      setIsUpdatingNote(true);
      
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select(`
          *,
          category:note_categories(*)
        `)
        .single();
      
      if (error) throw error;
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? data : note
      ));
      
      toast({
        title: 'Success',
        description: 'Note has been updated',
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingNote(false);
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    try {
      setIsDeletingNote(true);
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: 'Success',
        description: 'Note has been deleted',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load notes when profileId changes
  useEffect(() => {
    if (profileId) {
      fetchNotes(profileId);
    }
  }, [profileId]);

  return {
    notes,
    categories,
    isLoading,
    isAddingNote,
    isUpdatingNote,
    isDeletingNote,
    addNote,
    updateNote,
    deleteNote,
    refetchNotes: () => profileId ? fetchNotes(profileId) : Promise.resolve(),
    refetchCategories: fetchCategories
  };
}
