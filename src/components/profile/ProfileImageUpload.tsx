
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={currentImageUrl || undefined} alt={userName} />
          <AvatarFallback className="text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        {isEditing && (
          <div className="absolute -bottom-2 -right-2">
            <label htmlFor="profile-image-upload">
              <Button
                type="button"
                size="sm"
                className="rounded-full h-8 w-8 p-0"
                disabled={uploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Camera className="h-4 w-4" />
                </span>
              </Button>
            </label>
            <Input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <label htmlFor="profile-image-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer flex items-center gap-2">
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
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Removing...' : 'Remove'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
