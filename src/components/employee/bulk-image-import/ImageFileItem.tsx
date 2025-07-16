
import React from 'react';
import ImageFileStatus from './ImageFileStatus';

interface ImageFileWithData {
  file: File;
  employeeId: string;
  profileId?: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'skipped';
  error?: string;
  imageUrl?: string;
}

interface ImageFileItemProps {
  file: ImageFileWithData;
  index: number;
}

const ImageFileItem: React.FC<ImageFileItemProps> = ({ file, index }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex items-center space-x-3">
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
      <ImageFileStatus status={file.status} />
    </div>
  );
};

export default ImageFileItem;
