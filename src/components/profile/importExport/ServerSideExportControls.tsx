
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useProfileJsonRpc } from '@/hooks/profile/use-profile-json-rpc';

interface ServerSideExportControlsProps {
  profileId?: string;
}

export const ServerSideExportControls: React.FC<ServerSideExportControlsProps> = ({ profileId }) => {
  const { exportProfile, isExporting } = useProfileJsonRpc();

  const handleExport = async () => {
    await exportProfile(profileId);
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className="flex items-center gap-2"
      disabled={isExporting}
    >
      <Download className="h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export Profile Data'}
    </Button>
  );
};
