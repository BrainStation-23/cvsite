import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileJSONService } from '@/services/profile/ProfileJSONService';

interface ExportProfileControlsProps {
  profileData: any;
}

export const ExportProfileControls: React.FC<ExportProfileControlsProps> = ({ profileData }) => {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const exportData = ProfileJSONService.exportProfile(profileData);
      ProfileJSONService.downloadJSON(exportData, `profile-${new Date().toISOString().split('T')[0]}`);
      toast({
        title: 'Success',
        description: 'Profile data exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export profile data',
        variant: 'destructive'
      });
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export Profile Data
    </Button>
  );
};
