
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  profileId?: string;
  onImageUpdate: (imageUrl: string | null) => void;
  isEditing: boolean;
  userName: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  profileId,
  onImageUpdate,
  isEditing,
  userName
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use provided profileId or fallback to auth user id
  const targetProfileId = profileId || user?.id;

  const uploadImage = async (file: File) => {
    if (!targetProfileId) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);

      // Create file name with user ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${targetProfileId}/profile-${Date.now()}.${fileExt}`;

      // Delete existing image if it exists
      if (currentImageUrl) {
        await deleteCurrentImage();
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update the image URL in the parent component
      onImageUpdate(publicUrl);

      toast({
        title: 'Success',
        description: 'Profile image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteCurrentImage = async () => {
    if (!currentImageUrl || !targetProfileId) return;

    try {
      // Extract file path from URL
      const url = new URL(currentImageUrl);
      const filePath = url.pathname.split('/profile-images/')[1];
      
      if (filePath) {
        const { error } = await supabase.storage
          .from('profile-images')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting file from storage:', error);
        }
      }
    } catch (error) {
      console.error('Error parsing image URL:', error);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setDeleting(true);
      
      await deleteCurrentImage();
      onImageUpdate(null);

      toast({
        title: 'Success',
        description: 'Profile image removed successfully',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    uploadImage(file);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Profile Image Preview */}
      <div className="relative w-64">
        <AspectRatio ratio={4/3} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                  {getInitials(userName)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No image uploaded</p>
              </div>
            </div>
          )}
        </AspectRatio>
        
        {/* Camera overlay button for editing */}
        {isEditing && (
          <div className="absolute top-3 right-3">
            <label htmlFor="profile-image-upload">
              <Button
                type="button"
                size="sm"
                className="rounded-full h-10 w-10 p-0 shadow-lg"
                disabled={uploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Camera className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <label htmlFor="profile-image-upload" className="flex-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              className="w-full"
              asChild
            >
              <span className="cursor-pointer flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </span>
            </Button>
          </label>
          
          {currentImageUrl && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              disabled={deleting || uploading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Removing...' : 'Remove'}
            </Button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <Input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};
