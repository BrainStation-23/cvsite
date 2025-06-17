import React, { useState } from 'react';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';
import { MonacoJsonEditor } from './MonacoJsonEditor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Ajv, { ErrorObject } from 'ajv';
import profileSchema from '../../../public/profile.schema.json';
import { Copy, Download } from 'lucide-react';

interface JSONImportExportProps {
  profileData: ProfileJSONData;
  onImport: (data: ProfileJSONData) => Promise<boolean>;
}

export const JSONImportExport: React.FC<JSONImportExportProps> = ({ profileData, onImport }) => {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(profileData, null, 2));
  const [isImporting, setIsImporting] = useState(false);
  const ajv = new Ajv();
  const validate = ajv.compile(profileSchema);
  const [showSchema, setShowSchema] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
      toast({ title: 'Copied!', description: 'JSON copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy JSON.', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    try {
      const blob = new Blob([jsonInput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Exported!', description: 'JSON downloaded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to export JSON.', variant: 'destructive' });
    }
  };

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast({ title: 'Error', description: 'Paste or edit JSON to import.', variant: 'destructive' });
      return;
    }
    try {
      setIsImporting(true);
      const data = JSON.parse(jsonInput);
      const valid = validate(data);
      if (!valid) {
        const errors = (validate.errors || []).map((err: ErrorObject) => {
          const path = (err as any).instancePath || (err as any).dataPath || err.schemaPath || '';
          return `${path}: ${err.message}`;
        }).join('\n');
        toast({ title: 'Validation Error', description: errors, variant: 'destructive' });
        return;
      }
      const success = await onImport(data as ProfileJSONData);
      if (success) {
        toast({ title: 'Success', description: 'Profile data imported successfully.' });
      } else {
        toast({ title: 'Error', description: 'Failed to import profile data.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Invalid JSON format or structure.', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[80vh]" style={{ minHeight: 500 }}>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="font-semibold text-lg">Profile JSON</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} title="Download JSON">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button variant="outline" onClick={handleCopy} title="Copy JSON">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button variant="outline" onClick={() => setShowSchema(true)} title="Show JSON Schema">
              Schema
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
        {/* Schema Modal */}
        {showSchema && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">Required JSON Schema</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(JSON.stringify(profileSchema, null, 2));
                        toast({ title: 'Copied!', description: 'Schema copied to clipboard.' });
                      } catch {
                        toast({ title: 'Error', description: 'Failed to copy schema.', variant: 'destructive' });
                      }
                    }}
                  >
                    Copy Schema
                  </Button>
                  <button onClick={() => setShowSchema(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-lg">&times;</button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto p-4 text-xs bg-gray-100 dark:bg-gray-800 rounded-b-lg whitespace-pre-wrap">
{JSON.stringify(profileSchema, null, 2)}
              </pre>
            </div>
          </div>
        )}
        <div className="border rounded overflow-hidden flex-1 flex min-h-0">
          <MonacoJsonEditor
            value={jsonInput}
            onChange={setJsonInput}
            height="100%"
          />
        </div>
        <div className="mt-2 bg-muted p-2 rounded text-xs text-gray-700 dark:text-gray-300">
          <strong>How to use:</strong> Edit or paste your profile JSON above. Click <b>Import</b> to validate and update your profile. Use <b>Export</b> or <b>Copy</b> to save or share your data. All changes are validated against the required schema.
        </div>
      </div>
    </div>
  );
};
