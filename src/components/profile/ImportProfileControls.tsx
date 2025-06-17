import React, { useState } from 'react';
import Ajv, { ErrorObject } from 'ajv';
import profileSchema from '../../../public/profile.schema.json';
import { Button } from '@/components/ui/button';
import { MonacoJsonEditor } from './MonacoJsonEditor';
import { useToast } from '@/hooks/use-toast';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';

interface ImportProfileControlsProps {
  onImport: (data: ProfileJSONData) => Promise<boolean>;
}

export const ImportProfileControls: React.FC<ImportProfileControlsProps> = ({ onImport }) => {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const ajv = new Ajv();
const validate = ajv.compile(profileSchema);
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
      const data = JSON.parse(jsonInput);
      const valid = validate(data);
      if (!valid) {
        const errors = (validate.errors || []).map((err: ErrorObject) => {
  // Ajv v8 uses instancePath, v6/v7 use dataPath
  const path = (err as any).instancePath || (err as any).dataPath || err.schemaPath || '';
  return `${path}: ${err.message}`;
}).join('\n');
        toast({
          title: 'Validation Error',
          description: errors,
          variant: 'destructive'
        });
        return;
      }
      const success = await onImport(data as ProfileJSONData);
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

  return (
    <div className="space-y-4">
      <div className="bg-muted p-3 rounded text-xs text-gray-700 dark:text-gray-300">
        <strong>Import Guidelines:</strong>
        <ul className="list-disc ml-5 mt-1">
          <li>Paste or upload a valid profile JSON file matching the required schema.</li>
          <li>All required fields (personalInfo, technicalSkills, specializedSkills, experiences, education, trainings, achievements, projects) must be present.</li>
          <li>Each section must match the expected structure. See <code>profile.schema.json</code> for full details.</li>
          <li>Validation errors will be shown if the JSON does not match the schema.</li>
        </ul>
      </div>
      <div className="border rounded">
        <MonacoJsonEditor
          value={jsonInput}
          onChange={setJsonInput}
          height="300px"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleImport} disabled={isImporting}>
          Import Profile Data
        </Button>
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="profile-json-upload"
        />
        <label htmlFor="profile-json-upload">
          <Button asChild variant="outline">
            <span>Upload JSON File</span>
          </Button>
        </label>
      </div>
    </div>
  );
};
