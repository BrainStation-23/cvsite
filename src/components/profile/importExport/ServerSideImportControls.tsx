
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfileJsonRpc } from '@/hooks/profile/use-profile-json-rpc';
import * as Papa from 'papaparse';

interface ServerSideImportControlsProps {
  profileId?: string;
  onImportSuccess?: () => void;
}

export const ServerSideImportControls: React.FC<ServerSideImportControlsProps> = ({ 
  profileId, 
  onImportSuccess 
}) => {
  const { toast } = useToast();
  const { importProfile, isImporting } = useProfileJsonRpc();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      let data;

      // Handle JSON files
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } 
      // Handle CSV files using papaparse
      else if (file.name.endsWith('.csv')) {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (result.errors.length > 0) {
          throw new Error('CSV parsing failed: ' + result.errors[0].message);
        }
        // Convert CSV to JSON format - this would need custom logic based on CSV structure
        toast({
          title: 'CSV Import',
          description: 'CSV import requires custom mapping logic. Please use JSON format.',
          variant: 'destructive'
        });
        return;
      } else {
        throw new Error('Unsupported file format. Please use JSON files.');
      }

      const result = await importProfile(data, profileId);
      if (result.success && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('File import error:', error);
      toast({
        title: 'Import Error',
        description: error.message || 'Failed to import file',
        variant: 'destructive'
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop a JSON file here, or click to select
        </p>
        <input
          type="file"
          accept=".json,.csv"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isImporting}
        />
        <Button 
          variant="outline" 
          asChild
          disabled={isImporting}
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            {isImporting ? 'Importing...' : 'Select File'}
          </label>
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Supported formats: JSON. Server-side processing ensures secure validation and import.
      </div>
    </div>
  );
};
