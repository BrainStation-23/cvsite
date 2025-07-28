
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  parseResourcePlanningCSV, 
  validateCSVData, 
  downloadCSVTemplate,
  ENTITY_NAMES,
  CSVValidationResult 
} from '@/utils/resourcePlanningCsvUtils';
import { ResourcePlanningCSVValidation } from './ResourcePlanningCSVValidation';
import { SettingTableName } from '@/hooks/use-platform-settings';

interface ResourcePlanningBulkImportProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: SettingTableName;
  existingItems: any[];
  onBulkCreate: (items: { name: string }[]) => Promise<void>;
  onBulkUpdate: (items: { id: string; name: string }[]) => Promise<void>;
}

export const ResourcePlanningBulkImport: React.FC<ResourcePlanningBulkImportProps> = ({
  isOpen,
  onClose,
  tableName,
  existingItems,
  onBulkCreate,
  onBulkUpdate
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const entityName = ENTITY_NAMES[tableName];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file.',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);

    try {
      const data = await parseResourcePlanningCSV(selectedFile);
      const validation = validateCSVData(data, existingItems);
      setValidationResult(validation);
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: 'Failed to parse the CSV file. Please check the format.',
        variant: 'destructive'
      });
    }
  };

  const handleBulkCreate = async () => {
    if (!validationResult?.valid.length) return;

    setIsProcessing(true);
    try {
      await onBulkCreate(validationResult.valid);
      toast({
        title: 'Import successful',
        description: `${validationResult.valid.length} ${entityName.toLowerCase()}s imported successfully.`
      });
      handleClose();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import items. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!validationResult?.valid.length) return;

    setIsProcessing(true);
    try {
      // For updates, we need to match names with existing items
      const updateItems = validationResult.valid.map(validItem => {
        const existingItem = existingItems.find(
          item => item.name.toLowerCase() === validItem.name.toLowerCase()
        );
        return {
          id: existingItem?.id || '',
          name: validItem.name
        };
      }).filter(item => item.id); // Only include items with valid IDs

      await onBulkUpdate(updateItems);
      toast({
        title: 'Update successful',
        description: `${updateItems.length} ${entityName.toLowerCase()}s updated successfully.`
      });
      handleClose();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update items. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate(tableName);
    toast({
      title: 'Template downloaded',
      description: `CSV template for ${entityName.toLowerCase()}s has been downloaded.`
    });
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import {entityName}s</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Download className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Download CSV Template</h3>
              <p className="text-sm text-blue-700">
                Get the CSV template with the correct format for importing {entityName.toLowerCase()}s.
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-600">
              Select a CSV file containing {entityName.toLowerCase()} data to import.
            </p>
          </div>

          {/* Validation Results */}
          {file && validationResult && (
            <ResourcePlanningCSVValidation
              validationResult={validationResult}
              fileName={file.name}
            />
          )}

          {/* Import Actions */}
          {validationResult?.valid.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Bulk Create
                </TabsTrigger>
                <TabsTrigger value="update" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Bulk Update
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2">Bulk Create</h3>
                  <p className="text-sm text-green-700 mb-4">
                    This will create {validationResult.valid.length} new {entityName.toLowerCase()}s.
                    Items with duplicate names will be skipped.
                  </p>
                  <Button 
                    onClick={handleBulkCreate} 
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Creating...' : `Create ${validationResult.valid.length} Items`}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="update" className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-medium text-orange-900 mb-2">Bulk Update</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    This will update existing {entityName.toLowerCase()}s by matching names.
                    Only items that exist in the database will be updated.
                  </p>
                  <Button 
                    onClick={handleBulkUpdate} 
                    disabled={isProcessing}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Updating...' : `Update Matching Items`}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
