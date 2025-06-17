import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface MonacoJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export const MonacoJsonEditor: React.FC<MonacoJsonEditorProps> = ({ value, onChange, height = '300px' }) => {
  return (
    <MonacoEditor
      height={height}
      defaultLanguage="json"
      value={value}
      onChange={(val) => onChange(val || '')}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        fontSize: 14,
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        formatOnType: true,
        automaticLayout: true,
        lineNumbers: 'on',
      }}
    />
  );
};
