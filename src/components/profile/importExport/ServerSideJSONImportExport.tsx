import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MonacoJsonEditor } from './MonacoJsonEditor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Upload } from 'lucide-react';
import { useProfileJsonRpc } from '@/hooks/profile/use-profile-json-rpc';
import profileSchema from '../../../../public/profile.schema.json';
import Ajv, { ErrorObject } from 'ajv';

interface ServerSideJSONImportExportProps {
  profileId?: string;
  onImportSuccess?: () => void;
}

export const ServerSideJSONImportExport: React.FC<ServerSideJSONImportExportProps> = ({ 
  profileId, 
  onImportSuccess 
}) => {
  const { toast } = useToast();
  const { exportProfile, importProfile, isExporting, isImporting } = useProfileJsonRpc();
  const [jsonInput, setJsonInput] = useState<string>('{}');
  const [showSchema, setShowSchema] = useState(false);
  
  // Memoize the AJV validator to prevent re-creation on every render
  const validate = useMemo(() => {
    const ajv = new Ajv();
    return ajv.compile(profileSchema);
  }, []);

  // Fetch data automatically when component mounts - fix infinite loop
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const result = await exportProfile(profileId, false); // Don't download
        if (result.success && result.data) {
          setJsonInput(JSON.stringify(result.data, null, 2));
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    
    fetchInitialData();
  }, [profileId]); // Only depend on profileId, not exportProfile

  const handleFetch = useCallback(async () => {
    const result = await exportProfile(profileId, false); // Don't download
    if (result.success && result.data) {
      setJsonInput(JSON.stringify(result.data, null, 2));
    }
  }, [exportProfile, profileId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
      toast({ title: 'Copied!', description: 'JSON copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy JSON.', variant: 'destructive' });
    }
  }, [jsonInput, toast]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([jsonInput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded!', description: 'JSON file downloaded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to download JSON.', variant: 'destructive' });
    }
  }, [jsonInput, toast]);

  const handleImport = useCallback(async () => {
    if (!jsonInput.trim() || jsonInput.trim() === '{}') {
      toast({ title: 'Error', description: 'Please paste or load JSON data to import.', variant: 'destructive' });
      return;
    }

    try {
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

      const result = await importProfile(data, profileId);
      if (result.success && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Invalid JSON format or structure.', 
        variant: 'destructive' 
      });
    }
  }, [jsonInput, validate, importProfile, profileId, onImportSuccess, toast]);

  const handleCopySchema = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profileSchema, null, 2));
      toast({ title: 'Copied!', description: 'Schema copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy schema.', variant: 'destructive' });
    }
  }, [toast]);

  return (
    <div className="flex flex-col w-full h-[80vh]" style={{ minHeight: 500 }}>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="font-semibold text-lg">Profile JSON (Server-Side)</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleFetch} 
              disabled={isExporting}
              title="Fetch current profile data"
            >
              <Upload className="h-4 w-4 mr-1" /> 
              {isExporting ? 'Fetching...' : 'Fetch'}
            </Button>
            <Button variant="outline" onClick={handleDownload} title="Download JSON">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="outline" onClick={handleCopy} title="Copy JSON">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button variant="outline" onClick={() => setShowSchema(true)} title="Show JSON Schema">
              Schema
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
            >
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
                    onClick={handleCopySchema}
                  >
                    Copy Schema
                  </Button>
                  <button 
                    onClick={() => setShowSchema(false)} 
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-lg"
                  >
                    &times;
                  </button>
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
          <strong>Server-Side Import/Export:</strong> Click <b>Fetch</b> to load current profile data from the server. Edit or paste your profile JSON above. Click <b>Import</b> to validate and update your profile on the server. All operations are handled securely server-side with proper permissions.
        </div>
      </div>
    </div>
  );
};
