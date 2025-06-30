
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useProfileJsonRpc() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportProfile = async (targetUserId?: string) => {
    try {
      setIsExporting(true);
      
      const { data, error } = await supabase.rpc('export_profile_json', {
        target_user_id: targetUserId || null
      });

      if (error) {
        throw error;
      }

      // Create and download the JSON file
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

      return { success: true, data };
    } catch (error) {
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

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      const stats = data;
      toast({
        title: 'Import Successful',
        description: `Successfully imported ${stats.totalImported} items. General info: ${stats.generalInfo ? 'Updated' : 'Not updated'}, Technical skills: ${stats.technicalSkills}, Specialized skills: ${stats.specializedSkills}, Experiences: ${stats.experiences}, Education: ${stats.education}, Trainings: ${stats.trainings}, Achievements: ${stats.achievements}, Projects: ${stats.projects}`,
      });

      return { success: true, stats };
    } catch (error) {
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
