
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  profileId?: string;
  onImageUpdate: (imageUrl: string | null) => void;
  isEditing: boolean;
  userName: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ 
  currentImageUrl, 
  profileId, 
  onImageUpdate, 
  isEditing, 
  userName 
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) {
      toast({
        title: "Error",
        description: "Please select an image to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!profileId) {
      toast({
        title: "Error",
        description: "Profile ID is required to upload image.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = image.name.split('.').pop();
      const filePath = `avatars/${profileId}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        throw storageError;
      }

      // Update the general_information table
      const { error: updateError } = await supabase
        .from('general_information')
        .update({ profile_image: filePath })
        .eq('profile_id', profileId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });
      
      onImageUpdate(filePath);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setPreviewUrl(null);
    onImageUpdate(null);
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center space-y-4">
        {previewUrl ? (
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img
              src={previewUrl}
              alt={`${userName} Profile`}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{userName}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col space-y-4 p-4">
        {previewUrl && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto">
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="object-cover w-full h-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 p-1 bg-background/50 text-muted-foreground hover:text-foreground rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div>
          <Label htmlFor="profile-image">Upload Image</Label>
          <Input
            type="file"
            id="profile-image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
            className="hidden"
          />
          <Button asChild variant="outline" disabled={isUploading}>
            <Label htmlFor="profile-image" className="cursor-pointer">
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </>
              )}
            </Label>
          </Button>
        </div>
        {image && (
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileImageUpload;
