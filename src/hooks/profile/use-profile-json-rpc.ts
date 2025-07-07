
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
      console.log('=== EXPORT PROFILE START ===');
      console.log('Target user ID:', targetUserId);
      console.log('Should download:', shouldDownload);
      
      const { data, error } = await supabase.rpc('export_profile_json', {
        target_user_id: targetUserId || null
      });

      console.log('Export RPC response:', { data, error });

      if (error) {
        console.error('Export RPC error:', error);
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

      console.log('=== EXPORT PROFILE END ===');
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
      console.log('=== IMPORT PROFILE START ===');
      console.log('Target user ID:', targetUserId);
      console.log('Profile data to import:', profileData);
      
      // Validate required data structure
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Invalid profile data format');
      }

      const { data, error } = await supabase.rpc('import_profile_json', {
        profile_data: profileData,
        target_user_id: targetUserId || null
      });

      console.log('Import RPC response:', { data, error });

      if (error) {
        console.error('Import RPC error:', error);
        throw error;
      }

      // Properly cast the Json type to our interface with unknown first
      const result = data as unknown as ImportResult;

      if (!result.success) {
        console.error('Import failed with result:', result);
        throw new Error(result.error || 'Import failed');
      }

      console.log('Import successful with stats:', result);

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${result.totalImported || 0} items. General info: ${result.generalInfo ? 'Updated' : 'Not updated'}, Technical skills: ${result.technicalSkills || 0}, Specialized skills: ${result.specializedSkills || 0}, Experiences: ${result.experiences || 0}, Education: ${result.education || 0}, Trainings: ${result.trainings || 0}, Achievements: ${result.achievements || 0}, Projects: ${result.projects || 0}`,
      });

      console.log('=== IMPORT PROFILE END ===');
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
