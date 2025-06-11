
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileJson, Bot, FileText, Copy, ExternalLink, Info } from 'lucide-react';
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

  const handleCopyPrompt = async () => {
    try {
      const prompt = ProfileJSONService.generateGeminiPrompt();
      await navigator.clipboard.writeText(prompt);
      toast({
        title: 'Success',
        description: 'Prompt copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy prompt to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/', '_blank');
  };

  const handleOpenLinkedIn = () => {
    window.open('https://www.linkedin.com/in/me/', '_blank');
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
          {/* Detailed Instructions */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="space-y-3">
                <div className="font-semibold text-lg">📋 Step-by-Step Instructions:</div>
                
                <div className="space-y-2">
                  <div className="font-medium">1. Export your LinkedIn profile as PDF:</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div>• Click the "Go to LinkedIn Profile" button below</div>
                    <div>• On your LinkedIn profile page, look for the "More" button (three dots)</div>
                    <div>• Click "More" → "Save to PDF"</div>
                    <div>• Wait for the PDF to download to your computer</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">2. Get the Gemini AI prompt:</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div>• Copy the prompt using the "Copy Prompt" button below</div>
                    <div>• Or download it as a text file for reference</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">3. Use Gemini AI:</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div>• Click "Open Gemini AI" button below</div>
                    <div>• Paste the prompt into Gemini</div>
                    <div>• Upload your LinkedIn PDF file</div>
                    <div>• Wait for Gemini to generate the JSON response</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">4. Import the generated data:</div>
                  <div className="ml-4 space-y-1 text-sm">
                    <div>• Copy the JSON response from Gemini</div>
                    <div>• Paste it in the "Import Profile" section above</div>
                    <div>• Click "Import Profile Data" to update your profile</div>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={handleOpenLinkedIn} variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Go to LinkedIn Profile
            </Button>
            
            <Button onClick={handleCopyPrompt} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Prompt
            </Button>
            
            <Button onClick={handleOpenGemini} variant="outline" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Open Gemini AI
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownloadPrompt} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Download Prompt File
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
