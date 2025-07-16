import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Image, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkImageImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImageFileWithData {
  file: File;
  employeeId: string;
  profileId?: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'skipped';
  error?: string;
  imageUrl?: string;
}

const BulkImageImportModal: React.FC<BulkImageImportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<ImageFileWithData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const processedFiles: ImageFileWithData[] = [];

    for (const file of acceptedFiles) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `File ${file.name} is not an image file`,
          variant: 'destructive'
        });
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `Image ${file.name} must be less than 5MB`,
          variant: 'destructive'
        });
        continue;
      }

      // Extract employee ID from filename (remove extension)
      const employeeId = file.name.replace(/\.[^/.]+$/, '');

      processedFiles.push({
        file,
        employeeId,
        status: 'pending'
      });
    }

    setFiles(processedFiles);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  const findProfileIds = async () => {
    if (files.length === 0) return;

    const employeeIds = files.map(f => f.employeeId);
    
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, employee_id')
        .in('employee_id', employeeIds);

      if (error) throw error;

      const profileMap = new Map(profiles?.map(p => [p.employee_id, p.id]) || []);

      setFiles(prev => prev.map(file => ({
        ...file,
        profileId: profileMap.get(file.employeeId),
        status: profileMap.has(file.employeeId) ? 'pending' : 'skipped'
      })));

      const matched = files.filter(f => profileMap.has(f.employeeId)).length;
      const skipped = files.length - matched;

      toast({
        title: 'Profile matching complete',
        description: `Found ${matched} matches, ${skipped} files will be skipped`
      });
    } catch (error: any) {
      toast({
        title: 'Error finding profiles',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const uploadImageToSupabase = async (file: File, profileId: string): Promise<string> => {
    // Create file name with profile ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}/profile-${Date.now()}.${fileExt}`;

    // Upload image to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const updateProfileImage = async (profileId: string, imageUrl: string) => {
    // Check if general_information record exists
    const { data: existingInfo } = await supabase
      .from('general_information')
      .select('id, first_name, last_name')
      .eq('profile_id', profileId)
      .single();

    if (existingInfo) {
      // Update existing record
      const { error } = await supabase
        .from('general_information')
        .update({ profile_image: imageUrl })
        .eq('profile_id', profileId);

      if (error) throw error;
    } else {
      // Get profile data to create new general_information record
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Create new record with required fields
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
      // Get current image URL from general_information
      const { data: generalInfo } = await supabase
        .from('general_information')
        .select('profile_image')
        .eq('profile_id', profileId)
        .single();

      if (generalInfo?.profile_image) {
        // Extract file path from URL
        const url = new URL(generalInfo.profile_image);
        const filePath = url.pathname.split('/profile-images/')[1];
        
        if (filePath) {
          await supabase.storage
            .from('profile-images')
            .remove([filePath]);
        }
      }
    } catch (error) {
      // Don't throw error for deletion issues, just log
      console.warn('Could not delete existing image:', error);
    }
  };

  const processImageUploads = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const filesToProcess = files.filter(f => f.profileId && f.status === 'pending');
    const batchSize = 3; // Process 3 images at a time (smaller batch for image uploads)
    let processed = 0;

    for (let i = 0; i < filesToProcess.length; i += batchSize) {
      const batch = filesToProcess.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (file, index) => {
          const globalIndex = i + index;
          
          try {
            setFiles(prev => prev.map(f => 
              f.file.name === file.file.name 
                ? { ...f, status: 'processing' }
                : f
            ));

            // Delete existing image if any
            await deleteExistingImage(file.profileId!);

            // Upload new image
            const imageUrl = await uploadImageToSupabase(file.file, file.profileId!);

            // Update database
            await updateProfileImage(file.profileId!, imageUrl);

            setFiles(prev => prev.map(f => 
              f.file.name === file.file.name 
                ? { ...f, status: 'success', imageUrl }
                : f
            ));
          } catch (error: any) {
            setFiles(prev => prev.map(f => 
              f.file.name === file.file.name 
                ? { ...f, status: 'error', error: error.message }
                : f
            ));
          }
        })
      );

      processed += batch.length;
      setProgress((processed / filesToProcess.length) * 100);
    }

    setIsProcessing(false);
    
    const successful = files.filter(f => f.status === 'success').length;
    const failed = files.filter(f => f.status === 'error').length;
    const skipped = files.filter(f => f.status === 'skipped').length;

    toast({
      title: 'Bulk image upload complete',
      description: `Success: ${successful}, Failed: ${failed}, Skipped: ${skipped}`
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Image className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      success: 'default',
      error: 'destructive',
      skipped: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const reset = () => {
    setFiles([]);
    setProgress(0);
    setIsProcessing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Import Profile Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {files.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop image files here' : 'Drag & drop image files'}
              </h3>
              <p className="text-muted-foreground mb-2">
                Upload image files named with employee IDs (e.g., EMP001.jpg)
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: PNG, JPG, JPEG, GIF, WebP (Max 5MB each)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Images to Upload ({files.length})
                </h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={reset} disabled={isProcessing}>
                    Reset
                  </Button>
                  {files.some(f => !f.profileId) && (
                    <Button onClick={findProfileIds} disabled={isProcessing}>
                      Find Profiles
                    </Button>
                  )}
                  {files.some(f => f.profileId && f.status === 'pending') && (
                    <Button onClick={processImageUploads} disabled={isProcessing}>
                      Start Upload
                    </Button>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading images...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <ScrollArea className="h-96 border rounded">
                <div className="p-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <div className="flex-1">
                          <p className="font-medium">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Employee ID: {file.employeeId} • Size: {formatFileSize(file.file.size)}
                            {file.profileId && ` → Profile: ${file.profileId}`}
                          </p>
                          {file.error && (
                            <p className="text-sm text-red-500">{file.error}</p>
                          )}
                        </div>
                        {file.imageUrl && file.status === 'success' && (
                          <img 
                            src={file.imageUrl} 
                            alt="Uploaded" 
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                      </div>
                      {getStatusBadge(file.status)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImageImportModal;