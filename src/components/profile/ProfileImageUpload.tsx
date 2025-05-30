import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  userId: string;
  onUploadComplete: () => void;
  currentImageUrl?: string | null;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ userId, onUploadComplete, currentImageUrl }) => {
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

    setIsUploading(true);

    try {
      const fileExt = image.name.split('.').pop();
      const filePath = `avatars/${userId}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        throw storageError;
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', userId)
        .select();

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });
      onUploadComplete();
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
  };

  return (
    <Card>
      <CardContent className="flex flex-col space-y-4">
        {previewUrl && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
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
