
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Image } from 'lucide-react';

interface ImageFileStatusProps {
  status: 'pending' | 'processing' | 'success' | 'error' | 'skipped';
}

const ImageFileStatus: React.FC<ImageFileStatusProps> = ({ status }) => {
  const getStatusIcon = () => {
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

  const getStatusBadge = () => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      success: 'default',
      error: 'destructive',
      skipped: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon()}
      {getStatusBadge()}
    </div>
  );
};

export default ImageFileStatus;
