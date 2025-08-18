
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Copy, Image, ExternalLink } from 'lucide-react';
import { usePlaceholderImages } from '@/hooks/use-placeholder-images';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export const PlaceholderImageManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, isLoading, uploadImage, deleteImage, getImageUrl, isUploading, isDeleting } = usePlaceholderImages();
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      uploadImage(file);
    }
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const copyImageUrl = (imageName: string) => {
    const url = getImageUrl(imageName);
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  const openImageInNewTab = (imageName: string) => {
    const url = getImageUrl(imageName);
    window.open(url, '_blank');
  };

  const handleDeleteImage = (imageName: string) => {
    showConfirmation({
      title: 'Delete Placeholder Image',
      description: `Are you sure you want to delete "${imageName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: () => deleteImage(imageName)
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Placeholder Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Placeholder Images
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage placeholder images that can be used in CV templates. These images are publicly accessible.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Placeholder Image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload images that can be used as placeholders in CV templates
              </p>
              <Button 
                onClick={handleUploadClick} 
                disabled={isUploading}
                className="mb-2"
              >
                {isUploading ? 'Uploading...' : 'Select Image'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Images Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Uploaded Images ({images.length})
              </h3>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No placeholder images uploaded yet.</p>
                <p className="text-sm">Upload your first image to get started.</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="border rounded-lg p-4 space-y-3">
                      {/* Image Preview */}
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={getImageUrl(image.name)}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Image Info */}
                      <div>
                        <h4 className="font-medium text-sm truncate" title={image.name}>
                          {image.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(image.metadata?.size || 0)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {image.metadata?.mimetype || 'Unknown'}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyImageUrl(image.name)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openImageInNewTab(image.name)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.name)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {config && (
        <ConfirmationDialog
          isOpen={isOpen}
          onClose={hideConfirmation}
          onConfirm={handleConfirm}
          title={config.title}
          description={config.description}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          variant={config.variant}
        />
      )}
    </>
  );
};
