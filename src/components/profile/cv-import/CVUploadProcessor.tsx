
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useCVImport, CVUploadResult, CVAnalysisResult } from '@/hooks/use-cv-import';

interface CVUploadProcessorProps {
  onAnalysisComplete: (result: CVAnalysisResult) => void;
}

export const CVUploadProcessor: React.FC<CVUploadProcessorProps> = ({
  onAnalysisComplete
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'parsing' | 'analyzing' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadAndParseCV, analyzeCV, isProcessing, uploadResult } = useCVImport();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setCurrentStep('parsing');
    
    try {
      const uploadResult = await uploadAndParseCV(file);
      
      if (uploadResult) {
        setCurrentStep('analyzing');
        
        const analysisResult = await analyzeCV(uploadResult.extractedText);
        
        if (analysisResult) {
          setCurrentStep('complete');
          onAnalysisComplete(analysisResult);
        } else {
          setCurrentStep('upload');
        }
      } else {
        setCurrentStep('upload');
      }
    } catch (error) {
      console.error('CV processing error:', error);
      setCurrentStep('upload');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
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

  const getStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Your CV</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your CV here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: PDF, DOCX, TXT (Max 10MB)
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing}
              />
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                Choose File
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p><strong>Note:</strong> AI will extract and analyze your CV data automatically.</p>
              <p>• Skills without proficiency will default to level 1</p>
              <p>• Universities not in our database will be skipped</p>
              <p>• You can review and edit all extracted data before importing</p>
            </div>
          </div>
        );

      case 'parsing':
        return (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Extracting Text</h3>
            <p className="text-muted-foreground">
              Reading and parsing your CV file...
            </p>
          </div>
        );

      case 'analyzing':
        return (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
            <p className="text-muted-foreground">
              AI is extracting and structuring your profile data...
            </p>
            {uploadResult && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <FileText className="inline h-4 w-4 mr-1" />
                  {uploadResult.fileName} ({Math.round(uploadResult.fileSize / 1024)} KB)
                </p>
              </div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analysis Complete</h3>
            <p className="text-muted-foreground">
              Your CV has been successfully analyzed. Review the extracted data below.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import CV with AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getStepContent()}
      </CardContent>
    </Card>
  );
};
