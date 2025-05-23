
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Education } from '@/types';

// Type for database education record format
type EducationDB = {
  id: string;
  profile_id: string;
  university: string;
  degree: string | null;
  department: string | null;
  gpa?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean | null;
  created_at: string;
  updated_at: string;
};

// Map from database format to application model
const mapToEducation = (data: EducationDB): Education => ({
  id: data.id,
  university: data.university,
  degree: data.degree || '',
  department: data.department || undefined,
  gpa: data.gpa || undefined,
  startDate: new Date(data.start_date),
  endDate: data.end_date ? new Date(data.end_date) : undefined,
  isCurrent: data.is_current || false
});

// Map from application model to database format
const mapToEducationDB = (edu: Omit<Education, 'id'>, profileId: string) => ({
  profile_id: profileId,
  university: edu.university,
  degree: edu.degree || null,
  department: edu.department || null,
  gpa: edu.gpa || null,
  start_date: edu.startDate.toISOString().split('T')[0],
  end_date: edu.endDate ? edu.endDate.toISOString().split('T')[0] : null,
  is_current: edu.isCurrent || false
});

export function useEducation(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [education, setEducation] = useState<Education[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch education
  const fetchEducation = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map database records to application model format
        const mappedData = data.map(mapToEducation);
        setEducation(mappedData);
      }
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: 'Error',
        description: 'Failed to load education information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save education
  const saveEducation = async (educationData: Omit<Education, 'id'>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Convert to database format
      const dbData = mapToEducationDB(educationData, targetProfileId);
      
      const { data, error } = await supabase
        .from('education')
        .insert(dbData)
        .select();
      
      if (error) throw error;
      
      // Update local state with the new education entry
      if (data && data.length > 0) {
        const newEducation = mapToEducation(data[0] as EducationDB);
        setEducation(prev => [...prev, newEducation]);
      }
      
      toast({
        title: 'Success',
        description: 'Education has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: 'Error',
        description: 'Failed to add education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update education
  const updateEducation = async (id: string, educationData: Partial<Education>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Convert partial education data to database format
      const dbData: Partial<EducationDB> = {};
      
      if (educationData.university) dbData.university = educationData.university;
      if (educationData.degree !== undefined) dbData.degree = educationData.degree || null;
      if (educationData.department !== undefined) dbData.department = educationData.department || null;
      if (educationData.gpa !== undefined) dbData.gpa = educationData.gpa || null;
      if (educationData.startDate) dbData.start_date = educationData.startDate.toISOString().split('T')[0];
      
      if (educationData.endDate) {
        dbData.end_date = educationData.endDate.toISOString().split('T')[0];
      } else if (educationData.endDate === null) {
        dbData.end_date = null;
      }
      
      if (educationData.isCurrent !== undefined) dbData.is_current = educationData.isCurrent;
      
      dbData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('education')
        .update(dbData)
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setEducation(prev => 
        prev.map(edu => edu.id === id ? { ...edu, ...educationData } : edu)
      );
      
      toast({
        title: 'Success',
        description: 'Education has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating education:', error);
      toast({
        title: 'Error',
        description: 'Failed to update education',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete education
  const deleteEducation = async (id: string) => {
    if (!targetProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setEducation(prev => prev.filter(edu => edu.id !== id));
      
      toast({
        title: 'Success',
        description: 'Education has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove education',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load education data
  useEffect(() => {
    if (targetProfileId) {
      fetchEducation();
    }
  }, [targetProfileId]);

  return {
    education,
    isLoading,
    isSaving,
    saveEducation,
    updateEducation,
    deleteEducation
  };
}
