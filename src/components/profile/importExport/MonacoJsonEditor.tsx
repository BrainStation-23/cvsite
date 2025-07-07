
import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface MonacoJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  validationErrors?: Array<{
    message: string;
    line?: number;
    column?: number;
    path?: string;
  }>;
}

export const MonacoJsonEditor: React.FC<MonacoJsonEditorProps> = ({ 
  value, 
  onChange, 
  height = '300px',
  validationErrors = []
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && validationErrors.length > 0) {
      const editor = editorRef.current;
      const model = editor.getModel();
      
      if (model) {
        // Clear existing markers
        monaco.editor.removeAllMarkers('json-validation');
        
        // Add new markers for validation errors
        const markers = validationErrors.map((error, index) => {
          let line = 1;
          let column = 1;
          
          // Try to find the line/column based on the error path
          if (error.path) {
            const lines = value.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(error.path.split('/').pop() || '')) {
                line = i + 1;
                break;
              }
            }
          }
          
          return {
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: error.line || line,
            startColumn: error.column || column,
            endLineNumber: error.line || line,
            endColumn: error.column ? error.column + 10 : column + 10,
            message: error.message,
            source: 'json-validation'
          };
        });
        
        monaco.editor.setModelMarkers(model, 'json-validation', markers);
      }
    }
  }, [validationErrors, value]);

  return (
    <MonacoEditor
      height={height}
      defaultLanguage="json"
      value={value}
      onChange={(val) => onChange(val || '')}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        fontSize: 14,
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        formatOnType: true,
        automaticLayout: true,
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
      }}
    />
  );
};
