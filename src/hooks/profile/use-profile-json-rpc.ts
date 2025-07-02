import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportResult {
  success: boolean;
  error?: string;
  totalImported?: number;
  generalInfo?: boolean;
  technicalSkills?: number;
  specializedSkills?: number;
  experiences?: number;
  education?: number;
  trainings?: number;
  achievements?: number;
  projects?: number;
}

export function useProfileJsonRpc() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportProfile = async (targetUserId?: string, shouldDownload: boolean = true) => {
    try {
      setIsExporting(true);
      
      const { data, error } = await supabase.rpc('export_profile_json', {
        target_user_id: targetUserId || null
      });

      if (error) {
        throw error;
      }

      // Only download if explicitly requested
      if (shouldDownload) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `profile-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'Export Successful',
          description: 'Profile data has been exported successfully',
        });
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export profile data',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setIsExporting(false);
    }
  };

  const importProfile = async (profileData: any, targetUserId?: string) => {
    try {
      setIsImporting(true);
      
      const { data, error } = await supabase.rpc('import_profile_json', {
        profile_data: profileData,
        target_user_id: targetUserId || null
      });

      if (error) {
        throw error;
      }

      // Properly cast the Json type to our interface with unknown first
      const result = data as unknown as ImportResult;

      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${result.totalImported} items. General info: ${result.generalInfo ? 'Updated' : 'Not updated'}, Technical skills: ${result.technicalSkills}, Specialized skills: ${result.specializedSkills}, Experiences: ${result.experiences}, Education: ${result.education}, Trainings: ${result.trainings}, Achievements: ${result.achievements}, Projects: ${result.projects}`,
      });

      return { success: true, stats: result };
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import profile data',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportProfile,
    importProfile,
    isExporting,
    isImporting
  };
}
