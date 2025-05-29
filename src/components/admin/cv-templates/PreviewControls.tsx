
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { CVTemplate } from '@/types/cv-templates';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { EmployeeCombobox } from './EmployeeCombobox';

interface PreviewControlsProps {
  template: CVTemplate;
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  profiles: EmployeeProfile[];
  onExport?: () => void;
}

const PreviewControls: React.FC<PreviewControlsProps> = ({
  template,
  selectedProfileId,
  onProfileChange,
  profiles,
  onExport
}) => {
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);

  useEffect(() => {
    if (selectedProfileId && profiles) {
      const profile = profiles.find(p => p.id === selectedProfileId);
      setSelectedProfile(profile || null);
    }
  }, [selectedProfileId, profiles]);

  const handleProfileChange = (profileId: string) => {
    console.log('Profile selected in PreviewControls:', profileId);
    const profile = profiles?.find(p => p.id === profileId);
    setSelectedProfile(profile || null);
    onProfileChange(profileId);
  };

  const handleExport = () => {
    onExport?.();
  };

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
                profiles={profiles}
                value={selectedProfileId}
                onValueChange={handleProfileChange}
                placeholder="Select employee..."
                isLoading={false}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleExport} 
              disabled={!selectedProfile}
              className="h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
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
