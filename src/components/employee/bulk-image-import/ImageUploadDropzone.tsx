
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageUploadDropzoneProps {
  onDrop: (files: File[]) => void;
}

const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  return (
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
  );
};

export default ImageUploadDropzone;
