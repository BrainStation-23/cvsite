
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileJson, Bot, FileText } from 'lucide-react';
import { ProfileJSONService, ProfileJSONData } from '@/services/profile/ProfileJSONService';

interface JSONImportExportProps {
  profileData: {
    generalInfo: any;
    technicalSkills: any[];
    specializedSkills: any[];
    experiences: any[];
    education: any[];
    trainings: any[];
    achievements: any[];
    projects: any[];
  };
  onImport: (data: ProfileJSONData) => Promise<boolean>;
}

export const JSONImportExport: React.FC<JSONImportExportProps> = ({
  profileData,
  onImport
}) => {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

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

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste JSON data to import',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsImporting(true);
      const data = JSON.parse(jsonInput) as ProfileJSONData;
      
      // Validate the JSON structure
      if (!data.personalInfo || !Array.isArray(data.technicalSkills)) {
        throw new Error('Invalid JSON structure');
      }

      const success = await onImport(data);
      
      if (success) {
        setJsonInput('');
        toast({
          title: 'Success',
          description: 'Profile data imported successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to import profile data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Error',
        description: 'Invalid JSON format or structure',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a valid JSON file',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadPrompt = () => {
    ProfileJSONService.downloadPrompt();
    toast({
      title: 'Success',
      description: 'Gemini prompt downloaded successfully',
    });
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Profile
          </CardTitle>
          <CardDescription>
            Export your profile data as a JSON file for backup or sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} className="w-full">
            <FileJson className="h-4 w-4 mr-2" />
            Download Profile JSON
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Profile
          </CardTitle>
          <CardDescription>
            Import profile data from a JSON file or paste JSON directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="json-file">Upload JSON File</Label>
            <input
              id="json-file"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="json-input">Or Paste JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder="Paste your JSON profile data here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleImport} 
            disabled={isImporting || !jsonInput.trim()}
            className="w-full"
          >
            {isImporting ? 'Importing...' : 'Import Profile Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Gemini AI Integration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Powered Import from LinkedIn
          </CardTitle>
          <CardDescription>
            Use Gemini AI to convert your LinkedIn PDF to profile data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>How to use:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Download the Gemini prompt below</li>
                <li>Export your LinkedIn profile as PDF</li>
                <li>Use Gemini AI with the prompt and your LinkedIn PDF</li>
                <li>Copy the generated JSON and import it above</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={handleDownloadPrompt} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Download Gemini Prompt
            </Button>
            <Button 
              onClick={() => setShowPrompt(!showPrompt)} 
              variant="outline"
            >
              {showPrompt ? 'Hide' : 'View'} Prompt
            </Button>
          </div>

          {showPrompt && (
            <div className="bg-muted p-4 rounded-md">
              <Label className="text-sm font-medium">Gemini Prompt:</Label>
              <pre className="text-xs mt-2 whitespace-pre-wrap break-words">
                {ProfileJSONService.generateGeminiPrompt()}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
