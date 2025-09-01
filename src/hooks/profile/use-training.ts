import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Training } from '@/types';

// Type for database training record format
type TrainingDB = {
  id: string;
  profile_id: string;
  title: string;
  provider: string;
  description?: string;
  certification_date: string;
  certificate_url?: string;
  is_renewable: boolean;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
};

// Map from database format to application model
const mapToTraining = (data: TrainingDB): Training => ({
  id: data.id,
  title: data.title,
  provider: data.provider,
  description: data.description || '',
  date: data.certification_date,
  certificateUrl: data.certificate_url,
  isRenewable: data.is_renewable || false,
  expiryDate: data.expiry_date ? data.expiry_date : undefined
});

// Map from application model to database format
const mapToTrainingDB = (training: Omit<Training, 'id'>, profileId: string) => ({
  profile_id: profileId,
  title: training.title,
  provider: training.provider,
  description: training.description || null,
  certification_date: training.date,
  certificate_url: training.certificateUrl || null,
  is_renewable: training.isRenewable || false,
  expiry_date: training.expiryDate ? training.expiryDate : null
});

export function useTraining(profileId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  // Fetch trainings
  const fetchTrainings = async () => {
    if (!targetProfileId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('certification_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map database records to application model format
        const mappedData = data.map(mapToTraining);
        setTrainings(mappedData);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load training information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save training
  const saveTraining = async (training: Omit<Training, 'id'>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Convert to database format
      const dbData = mapToTrainingDB(training, targetProfileId);
      
      const { data, error } = await supabase
        .from('trainings')
        .insert(dbData)
        .select();
      
      if (error) throw error;
      
      // Update local state with the new training entry
      if (data && data.length > 0) {
        const newTraining = mapToTraining(data[0] as TrainingDB);
        setTrainings(prev => [...prev, newTraining]);
      }
      
      toast({
        title: 'Success',
        description: 'Training has been added',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving training:', error);
      toast({
        title: 'Error',
        description: 'Failed to add training',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update training
  const updateTraining = async (id: string, training: Partial<Training>) => {
    if (!targetProfileId) return false;
    
    try {
      setIsSaving(true);
      
      // Convert partial training data to database format
      const dbData: Partial<TrainingDB> = {};
      
      if (training.title) dbData.title = training.title;
      if (training.provider) dbData.provider = training.provider;
      if (training.description !== undefined) dbData.description = training.description;
      if (training.date) dbData.certification_date = training.date;
      if (training.certificateUrl !== undefined) dbData.certificate_url = training.certificateUrl;
      if (training.isRenewable !== undefined) dbData.is_renewable = training.isRenewable;
      if (training.expiryDate !== undefined) {
        dbData.expiry_date = training.expiryDate ? training.expiryDate : null;
      }
      
      dbData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('trainings')
        .update(dbData)
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setTrainings(prev => 
        prev.map(item => item.id === id ? { ...item, ...training } : item)
      );
      
      toast({
        title: 'Success',
        description: 'Training has been updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating training:', error);
      toast({
        title: 'Error',
        description: 'Failed to update training',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete training
  const deleteTraining = async (id: string) => {
    if (!targetProfileId) return false;
    
    try {
      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)
        .eq('profile_id', targetProfileId);
      
      if (error) throw error;
      
      // Update local state
      setTrainings(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Training has been removed',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting training:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove training',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load trainings data
  useEffect(() => {
    if (targetProfileId) {
      fetchTrainings();
    }
  }, [targetProfileId]);

  return {
    trainings,
    isLoading,
    isSaving,
    saveTraining,
    updateTraining,
    deleteTraining
  };
}
