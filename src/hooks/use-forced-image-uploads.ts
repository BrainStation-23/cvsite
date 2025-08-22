
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ForcedUploadData {
  profileId: string;
  validationErrors: string[];
  imageUrl: string;
}

export const useForcedImageUploads = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);

  const recordForcedUpload = async (data: ForcedUploadData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive'
      });
      return false;
    }

    try {
      setIsRecording(true);

      const { error } = await supabase
        .from('forced_image_uploads')
        .insert({
          profile_id: data.profileId,
          uploaded_by_user_id: user.id,
          validation_errors: data.validationErrors,
          image_url: data.imageUrl,
          upload_timestamp: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Warning Recorded',
        description: 'Forced upload has been logged for audit purposes',
        variant: 'default'
      });

      return true;
    } catch (error) {
      console.error('Error recording forced upload:', error);
      toast({
        title: 'Error',
        description: 'Failed to record forced upload',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsRecording(false);
    }
  };

  return {
    recordForcedUpload,
    isRecording
  };
};
