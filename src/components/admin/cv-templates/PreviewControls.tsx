
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { CVTemplate } from '@/types/cv-templates';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { EmployeeCombobox } from './EmployeeCombobox';
import ExportButton from './ExportButton';
import { useTemplateConfiguration } from '@/hooks/use-template-configuration';
import { useEmployeeData } from '@/hooks/use-employee-data';

interface PreviewControlsProps {
  template: CVTemplate;
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  onExport?: () => void;
  templateId?: string;
}

const PreviewControls: React.FC<PreviewControlsProps> = ({
  template,
  selectedProfileId,
  onProfileChange,
  onExport,
  templateId
}) => {
  // Fetch the selected profile data
  const {
    data: selectedProfile,
    isLoading: profileLoading
  } = useEmployeeData(selectedProfileId);

  const handleProfileChange = (profileId: string) => {
    console.log('Profile selected in PreviewControls:', profileId);
    onProfileChange(profileId);
  };

  const handleExport = () => {
    onExport?.();
  };

  // Get template configuration for export
  const { sections: templateSections, fieldMappings: templateFieldMappings } = useTemplateConfiguration(templateId || '');

  return (
    <div className="space-y-4">
      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Employee Profile</Label>
            <div className="mt-1">
              <EmployeeCombobox
                value={selectedProfileId}
                onValueChange={handleProfileChange}
                placeholder="Select employee..."
                disabled={false}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <ExportButton
              template={template}
              profile={selectedProfile}
              sections={templateSections || []}
              fieldMappings={templateFieldMappings || []}
              styles={{}} // TODO: get actual styles
              disabled={!selectedProfile}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Template Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Orientation:</span> {template.orientation}
          </div>
          <div className="text-xs">
            <span className="font-medium">Status:</span> 
            <span className={`ml-1 ${template.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {template.description && (
            <div className="text-xs">
              <span className="font-medium">Description:</span>
              <p className="text-gray-600 mt-1 text-xs">{template.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewControls;
