import React, { useState } from 'react';
import { CVUploadProcessor } from './CVUploadProcessor';
import { CVAnalysisReview } from './CVAnalysisReview';
import { useProfileJsonRpc } from '@/hooks/profile/use-profile-json-rpc';
import { CVProcessResult } from '@/hooks/use-cv-import';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CVImportTabProps {
  profileId?: string;
  onImportSuccess?: () => void;
  // Import handlers from profile - keeping for compatibility but not using
  saveGeneralInfo: (data: any) => Promise<boolean>;
  saveTechnicalSkill: (skill: any) => Promise<boolean>;
  saveSpecializedSkill: (skill: any) => Promise<boolean>;
  saveExperience: (experience: any) => Promise<boolean>;
  saveEducation: (education: any) => Promise<boolean>;
  saveTraining: (training: any) => Promise<boolean>;
  saveAchievement: (achievement: any) => Promise<boolean>;
  saveProject: (project: any) => Promise<boolean>;
}

export const CVImportTab: React.FC<CVImportTabProps> = ({
  profileId,
  onImportSuccess
}) => {
  const [analysisResult, setAnalysisResult] = useState<CVProcessResult | null>(null);
  const { importProfile, isImporting } = useProfileJsonRpc();

  const handleAnalysisComplete = (result: CVProcessResult) => {
    setAnalysisResult(result);
  };

  const handleImport = async (profileData: ProfileJSONData) => {
    try {
      const result = await importProfile(profileData, profileId);
      if (result.success && onImportSuccess) {
        onImportSuccess();
        // Reset the analysis result after successful import
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleEdit = () => {
    // For now, we'll just reset to allow re-upload
    // In a full implementation, you might want to show an edit form
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  if (analysisResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
        </div>
        
        <CVAnalysisReview
          analysisResult={analysisResult}
          onImport={handleImport}
          onEdit={handleEdit}
          isImporting={isImporting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Import CV with AI</h2>
        <p className="text-muted-foreground">
          Upload your CV in PDF, DOCX, or TXT format and let AI extract and structure your profile data automatically.
        </p>
      </div>
      
      <CVUploadProcessor onAnalysisComplete={handleAnalysisComplete} />
    </div>
  );
};
