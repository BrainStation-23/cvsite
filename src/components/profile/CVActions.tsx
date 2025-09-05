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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TabsContent, TabsList } from '@/components/ui/tabs';
import { TabTriggerWithIcon } from './tabs/TabTriggerWithIcon';
import {
  FileJson,
  Bot
} from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { CVImportTab } from './cv-import/CVImportTab';
import { ServerSideJSONImportExport } from './importExport/ServerSideJSONImportExport';
interface CVActionsProps {
  profileId?: string; // Optional for when viewing other profiles
  onDataChange?: () => void; // <-- Add this line
}

export const CVActions: React.FC<CVActionsProps> = ({ profileId, onDataChange }) => {
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

        <div className="flex gap-2 flex-1 justify-between">
          <div className='flex gap-2'>
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
          <div className='flex gap-2 items-center'>
            <div>
              <Sheet>
                <SheetTrigger>
                  <Button variant="outline" className="ml-2">
                    AI Import
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[86%] !max-w-none">
                  <SheetHeader>
                    <SheetTitle>
                      <Tabs defaultValue="cv-import" className="w-full h-full flex flex-col mt-3">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 dark:bg-gray-800 rounded-md p-2 mt-6">
                          <TabTriggerWithIcon
                            value="cv-import"
                            icon={Bot}
                            label="AI Import"
                            isEmpty={false}
                            dataTour="cv-import-tab"
                          />
                          <TabTriggerWithIcon
                            value="json"
                            icon={FileJson}
                            label="JSON"
                            isEmpty={false}
                            dataTour="json-tab"
                          />
                        </TabsList>
                        <TabsContent value="cv-import" className="mt-6">
                          <CVImportTab
                            profileId={profileId}
                            onImportSuccess={onDataChange}
                          />
                        </TabsContent>

                        <TabsContent value="json" className="mt-6">
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-bold mb-4">Import/Export Profile Data</h2>
                              <p className="text-muted-foreground mb-6">
                                Import or export your complete profile data as JSON. All operations are processed securely on the server.
                              </p>
                            </div>

                            <ServerSideJSONImportExport
                              profileId={profileId}
                              onImportSuccess={onDataChange}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
            <CvAuditLogsDialog profileId={targetProfileId} />
          </div>
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
