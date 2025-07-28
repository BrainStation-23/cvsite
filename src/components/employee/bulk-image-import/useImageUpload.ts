
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageFileWithData {
  file: File;
  employeeId: string;
  profileId?: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'skipped';
  error?: string;
  imageUrl?: string;
}

export const useImageUpload = () => {
  const { toast } = useToast();

  const uploadImageToSupabase = async (file: File, profileId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}/profile-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const updateProfileImage = async (profileId: string, imageUrl: string) => {
    const { data: existingInfo } = await supabase
      .from('general_information')
      .select('id, first_name, last_name')
      .eq('profile_id', profileId)
      .single();

    if (existingInfo) {
      const { error } = await supabase
        .from('general_information')
        .update({ profile_image: imageUrl })
        .eq('profile_id', profileId);

      if (error) throw error;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('general_information')
        .insert({
          profile_id: profileId,
          first_name: profile.first_name || 'Unknown',
          last_name: profile.last_name || 'User',
          profile_image: imageUrl
        });

      if (error) throw error;
    }
  };

  const deleteExistingImage = async (profileId: string) => {
    try {
      const { data: generalInfo } = await supabase
        .from('general_information')
        .select('profile_image')
        .eq('profile_id', profileId)
        .single();

      if (generalInfo?.profile_image) {
        const url = new URL(generalInfo.profile_image);
        const filePath = url.pathname.split('/profile-images/')[1];
        
        if (filePath) {
          await supabase.storage
            .from('profile-images')
            .remove([filePath]);
        }
      }
    } catch (error) {
      console.warn('Could not delete existing image:', error);
    }
  };

  const findProfileIds = async (files: ImageFileWithData[]): Promise<ImageFileWithData[]> => {
    if (files.length === 0) return files;

    const employeeIds = files.map(f => f.employeeId);
    
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, employee_id')
        .in('employee_id', employeeIds);

      if (error) throw error;

      const profileMap = new Map(profiles?.map(p => [p.employee_id, p.id]) || []);

      const updatedFiles = files.map(file => ({
        ...file,
        profileId: profileMap.get(file.employeeId),
        status: profileMap.has(file.employeeId) ? 'pending' as const : 'skipped' as const
      }));

      const matched = updatedFiles.filter(f => f.profileId).length;
      const skipped = files.length - matched;

      toast({
        title: 'Profile matching complete',
        description: `Found ${matched} matches, ${skipped} files will be skipped`
      });

      return updatedFiles;
    } catch (error: any) {
      toast({
        title: 'Error finding profiles',
        description: error.message,
        variant: 'destructive'
      });
      return files;
    }
  };

  return {
    uploadImageToSupabase,
    updateProfileImage,
    deleteExistingImage,
    findProfileIds
  };
};
