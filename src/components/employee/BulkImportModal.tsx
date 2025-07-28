import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileWithContent {
  file: File;
  content: any;
  employeeId: string;
  profileId?: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'skipped';
  error?: string;
  result?: any;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithContent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const processedFiles: FileWithContent[] = [];

    for (const file of acceptedFiles) {
      if (!file.name.endsWith('.json')) {
        toast({
          title: 'Invalid file type',
          description: `File ${file.name} is not a JSON file`,
          variant: 'destructive'
        });
        continue;
      }

      try {
        const text = await file.text();
        const content = JSON.parse(text);
        const employeeId = file.name.replace('.json', '');

        processedFiles.push({
          file,
          content,
          employeeId,
          status: 'pending'
        });
      } catch (error) {
        toast({
          title: 'File parsing error',
          description: `Could not parse ${file.name}: ${error}`,
          variant: 'destructive'
        });
      }
    }

    setFiles(processedFiles);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
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

  const processImports = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const filesToProcess = files.filter(f => f.profileId && f.status === 'pending');
    const batchSize = 5; // Process 5 files at a time
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

            const { data, error } = await supabase.rpc('import_profile_json', {
              profile_data: file.content,
              target_user_id: file.profileId
            });

            if (error) throw error;

            setFiles(prev => prev.map(f => 
              f.file.name === file.file.name 
                ? { ...f, status: 'success', result: data }
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
      title: 'Bulk import complete',
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
        return <FileText className="h-4 w-4 text-gray-500" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Import Employee Data</DialogTitle>
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
                {isDragActive ? 'Drop JSON files here' : 'Drag & drop JSON files'}
              </h3>
              <p className="text-muted-foreground">
                Upload JSON files named with employee IDs (e.g., EMP001.json)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Files to Import ({files.length})
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
                    <Button onClick={processImports} disabled={isProcessing}>
                      Start Import
                    </Button>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing files...</span>
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
                        <div>
                          <p className="font-medium">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Employee ID: {file.employeeId}
                            {file.profileId && ` → Profile: ${file.profileId}`}
                          </p>
                          {file.error && (
                            <p className="text-sm text-red-500">{file.error}</p>
                          )}
                        </div>
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

export default BulkImportModal;