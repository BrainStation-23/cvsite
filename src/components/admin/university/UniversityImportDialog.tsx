
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { downloadCSVTemplate } from '@/utils/csvUtils';

interface UniversityImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToImport: () => void;
}

const UniversityImportDialog: React.FC<UniversityImportDialogProps> = ({
  isOpen,
  onClose,
  onProceedToImport
}) => {
  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Import Guidelines
          </DialogTitle>
          <DialogDescription>
            Follow these guidelines to properly format your university data for import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Required CSV Format
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Your CSV file must include the following columns:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>name</strong> - University name (required)</li>
                  <li><strong>type</strong> - Must be either "public" or "private" (required)</li>
                  <li><strong>acronyms</strong> - Common abbreviations, separated by commas (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Example Format</h4>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                <div>name,type,acronyms</div>
                <div>Harvard University,private,HU</div>
                <div>University of California Berkeley,public,"UC Berkeley, UCB"</div>
                <div>Massachusetts Institute of Technology,private,MIT</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Important Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>The first row must contain column headers</li>
                <li>University names must be unique</li>
                <li>Type field accepts only "public" or "private"</li>
                <li>Multiple acronyms should be separated by commas</li>
                <li>Duplicate universities will be rejected during import</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onProceedToImport}>
                Continue to Import
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversityImportDialog;
