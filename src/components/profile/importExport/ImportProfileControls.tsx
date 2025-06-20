
import React, { useState } from 'react';
import Ajv, { ErrorObject } from 'ajv';
import profileSchema from '../../../../public/profile.schema.json';
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

  const ajv = new Ajv({ allErrors: true, strict: false });
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
      
      // Validate but be more lenient with errors
      const valid = validate(data);
      if (!valid && validate.errors) {
        const criticalErrors = validate.errors.filter((err: ErrorObject) => {
          // Only treat missing required fields as critical errors
          return err.keyword === 'required' && 
                 ['personalInfo', 'technicalSkills', 'specializedSkills', 'experiences', 'education', 'trainings', 'achievements', 'projects'].includes(err.params?.missingProperty);
        });
        
        if (criticalErrors.length > 0) {
          const errors = criticalErrors.map((err: ErrorObject) => {
            const path = (err as any).instancePath || (err as any).dataPath || err.schemaPath || '';
            return `${path}: ${err.message}`;
          }).join('\n');
          
          toast({
            title: 'Critical Validation Error',
            description: `Missing required sections: ${errors}`,
            variant: 'destructive'
          });
          return;
        }
        
        // Show warning for non-critical errors but continue with import
        if (validate.errors.length > 0) {
          toast({
            title: 'Data Format Warning', 
            description: 'Some fields may not match expected format but import will continue. Invalid data will be skipped.',
          });
        }
      }
      
      const success = await onImport(data as ProfileJSONData);
      if (success) {
        setJsonInput('');
        toast({
          title: 'Success',
          description: 'Profile data imported successfully. Invalid fields were automatically handled.',
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
        description: 'Invalid JSON format. Please check your JSON syntax.',
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
          <li>Only required fields: Personal Info (firstName, lastName), Training (title), Education (university), Experience (companyName, designation), Project (name, description), Achievement (title, description).</li>
          <li>Invalid dates like "Jan 2024", "Continuing" are automatically parsed. Invalid dates are skipped rather than rejecting the entire entry.</li>
          <li>Missing optional fields are handled gracefully with sensible defaults.</li>
          <li>The system will import valid data and skip invalid entries, showing a detailed report.</li>
          <li>Use current_designation for personal info (will be mapped correctly).</li>
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
          {isImporting ? 'Importing...' : 'Import Profile Data'}
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
