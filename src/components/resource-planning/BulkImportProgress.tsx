
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentItem: string;
  isComplete: boolean;
}

interface BulkImportProgressProps {
  progress: ImportProgress;
  isProcessing: boolean;
  errorCount: number;
  onDownloadErrors: () => void;
}

export const BulkImportProgress: React.FC<BulkImportProgressProps> = ({
  progress,
  isProcessing,
  errorCount,
  onDownloadErrors
}) => {
  const progressPercentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  if (!isProcessing && !progress.isComplete) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {progress.isComplete ? (
            progress.failed === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )
          ) : (
            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
          {progress.isComplete ? 'Import Complete' : 'Importing Records'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progress.processed} / {progress.total}</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Current Item */}
        {isProcessing && progress.currentItem && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Processing:</span> {progress.currentItem}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Successful</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{progress.successful}</div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-800">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">{progress.total}</div>
          </div>
        </div>

        {/* Download Errors Button */}
        {progress.isComplete && errorCount > 0 && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onDownloadErrors}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Error Report ({errorCount} failed records)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
