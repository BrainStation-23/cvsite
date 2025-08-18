
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ImageUploadDropzone from './bulk-image-import/ImageUploadDropzone';
import ImageImportActions from './bulk-image-import/ImageImportActions';
import ImageImportProgress from './bulk-image-import/ImageImportProgress';
import ImageFileItem from './bulk-image-import/ImageFileItem';
import { useImageUpload } from './bulk-image-import/useImageUpload';

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
  
  const { uploadImageToSupabase, updateProfileImage, findProfileIds } = useImageUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const processedFiles: ImageFileWithData[] = [];

    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `File ${file.name} is not an image file`,
          variant: 'destructive'
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `Image ${file.name} must be less than 5MB`,
          variant: 'destructive'
        });
        continue;
      }

      const employeeId = file.name.replace(/\.[^/.]+$/, '');

      processedFiles.push({
        file,
        employeeId,
        status: 'pending'
      });
    }

    setFiles(processedFiles);
  }, [toast]);

  const handleFindProfiles = async () => {
    const updatedFiles = await findProfileIds(files);
    setFiles(updatedFiles);
  };

  const processImageUploads = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const filesToProcess = files.filter(f => f.profileId && f.status === 'pending');
    const batchSize = 3;
    let processed = 0;

    for (let i = 0; i < filesToProcess.length; i += batchSize) {
      const batch = filesToProcess.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (file, index) => {
          try {
            setFiles(prev => prev.map(f => 
              f.file.name === file.file.name 
                ? { ...f, status: 'processing' }
                : f
            ));

            // No longer calling deleteExistingImage - upsert handles replacement
            const imageUrl = await uploadImageToSupabase(file.file, file.profileId!);
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

  const reset = () => {
    setFiles([]);
    setProgress(0);
    setIsProcessing(false);
  };

  const hasUnmatchedFiles = files.some(f => !f.profileId);
  const hasPendingFiles = files.some(f => f.profileId && f.status === 'pending');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Import Profile Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {files.length === 0 ? (
            <ImageUploadDropzone onDrop={onDrop} />
          ) : (
            <div className="space-y-4">
              <ImageImportActions
                filesCount={files.length}
                hasUnmatchedFiles={hasUnmatchedFiles}
                hasPendingFiles={hasPendingFiles}
                isProcessing={isProcessing}
                onReset={reset}
                onFindProfiles={handleFindProfiles}
                onStartUpload={processImageUploads}
              />

              <ImageImportProgress isProcessing={isProcessing} progress={progress} />

              <ScrollArea className="h-96 border rounded">
                <div className="p-4 space-y-2">
                  {files.map((file, index) => (
                    <ImageFileItem key={index} file={file} index={index} />
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
