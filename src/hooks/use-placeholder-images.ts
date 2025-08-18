
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlaceholderImage {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

export const usePlaceholderImages = () => {
  const queryClient = useQueryClient();

  const { data: images, isLoading } = useQuery({
    queryKey: ['placeholder-images'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('placeholder-images')
        .list('', {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error fetching placeholder images:', error);
        throw error;
      }

      return data || [];
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('placeholder-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading placeholder image:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeholder-images'] });
      toast.success('Image uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageName: string) => {
      const { error } = await supabase.storage
        .from('placeholder-images')
        .remove([imageName]);

      if (error) {
        console.error('Error deleting placeholder image:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeholder-images'] });
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    },
  });

  const getImageUrl = (imageName: string): string => {
    const { data } = supabase.storage
      .from('placeholder-images')
      .getPublicUrl(imageName);
    
    return data.publicUrl;
  };

  return {
    images: images || [],
    isLoading,
    uploadImage: uploadImageMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    getImageUrl,
    isUploading: uploadImageMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
  };
};
