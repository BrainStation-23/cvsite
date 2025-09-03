import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Eye, FileDown, Loader2 } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { openCVPreview } from '@/utils/cv-preview-utility';
import { exportCVAsPDF, ProgressDialog, ProgressStep } from '@/utils/pdf-export';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CvAuditLogsDialog from '@/components/profile/CvAuditLogsDialog';

interface CVActionsProps {
  profileId?: string; // Optional for when viewing other profiles
}

export const CVActions: React.FC<CVActionsProps> = ({ profileId }) => {
  const { user } = useAuth();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [progress, setProgress] = useState(0);

  const { templates, isLoading: templatesLoading } = useCVTemplates();

  // Filter for enabled templates only
  const enabledTemplates = templates.filter(template => template.enabled);

  // Use the provided profileId or fallback to current user's profile ID
  const targetProfileId = profileId || user?.id;

  // Auto-select default template when templates load
  React.useEffect(() => {
    if (enabledTemplates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = enabledTemplates.find(template => template.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      } else if (enabledTemplates.length > 0) {
        setSelectedTemplateId(enabledTemplates[0].id);
      }
    }
  }, [enabledTemplates, selectedTemplateId]);

  const handlePreview = async () => {
    if (!selectedTemplateId || !targetProfileId) {
      toast.error('Please select a CV template');
      return;
    }

    setIsPreviewing(true);

    try {
      await openCVPreview(targetProfileId, selectedTemplateId);
      toast.success('CV preview opened in new tab!');
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Failed to open preview. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedTemplateId || !targetProfileId) {
      toast.error('Please select a CV template');
      return;
    }
    
    try {
      setIsExporting(true);
      setShowProgressDialog(true);
      
      await exportCVAsPDF(targetProfileId, selectedTemplateId, {
        onProgress: (steps, progressValue) => {
          setProgressSteps(steps);
          setProgress(progressValue);
        }
      });
      
      // Keep dialog open for a moment to show completion
      setTimeout(() => {
        setShowProgressDialog(false);
        setIsExporting(false);
        toast.success('PDF downloaded successfully');
      }, 1000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      setShowProgressDialog(false);
      setIsExporting(false);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (!targetProfileId) {
    return null; // Don't render if no profile ID available
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex-1 max-w-xs">
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
            disabled={templatesLoading || isExporting || isPreviewing}
          >
            <SelectTrigger id="cv-template-select">
              <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Choose template"} />
            </SelectTrigger>
            <SelectContent>
              {enabledTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                  {template.is_default && ' (Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <CvAuditLogsDialog profileId={targetProfileId} />
          
          <Button 
            variant="outline"
            onClick={handlePreview}
            disabled={!selectedTemplateId || templatesLoading || isPreviewing || isExporting}
          >
            {isPreviewing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview CV
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleExportPDF}
            disabled={!selectedTemplateId || templatesLoading || isExporting || isPreviewing}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Dialog */}
      <ProgressDialog
        isOpen={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        title="Generating PDF"
        steps={progressSteps}
        progress={progress}
        allowCancel={false}
      />
    </>
  );
};
