
import React, { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CVTemplateHTMLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CVTemplateHTMLEditor: React.FC<CVTemplateHTMLEditorProps> = ({
  value,
  onChange,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // Configure Monaco for template variables
    if (editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      
      if (model) {
        // Register custom completion provider for template variables
        monaco.languages.registerCompletionItemProvider('html', {
          provideCompletionItems: (model, position) => {
            // Get the current word range
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };

            const suggestions: monaco.languages.CompletionItem[] = [
              {
                label: '{{employee.firstName}}',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '{{employee.firstName}}',
                documentation: 'Employee first name',
                range: range
              },
              {
                label: '{{employee.lastName}}',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '{{employee.lastName}}',
                documentation: 'Employee last name',
                range: range
              },
              {
                label: '{{employee.email}}',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '{{employee.email}}',
                documentation: 'Employee email address',
                range: range
              },
              {
                label: '{{employee.biography}}',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '{{employee.biography}}',
                documentation: 'Employee biography',
                range: range
              },
              {
                label: '{{employee.currentDesignation}}',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '{{employee.currentDesignation}}',
                documentation: 'Current designation',
                range: range
              },
              {
                label: '{{#each employee.technicalSkills}}',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '{{#each employee.technicalSkills}}\n  <li>{{this.name}} - {{this.proficiency}}/10</li>\n{{/each}}',
                documentation: 'Loop through technical skills',
                range: range
              },
              {
                label: '{{#each employee.experiences}}',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '{{#each employee.experiences}}\n  <div>\n    <h3>{{this.designation}} at {{this.companyName}}</h3>\n    <p>{{this.startDate}} - {{this.endDate}}</p>\n  </div>\n{{/each}}',
                documentation: 'Loop through work experiences',
                range: range
              },
              {
                label: '{{#each employee.education}}',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '{{#each employee.education}}\n  <div>\n    <h3>{{this.degree}} - {{this.department}}</h3>\n    <p>{{this.university}}</p>\n  </div>\n{{/each}}',
                documentation: 'Loop through education',
                range: range
              }
            ];

            return { suggestions };
          }
        });
      }
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium text-sm">HTML Template Editor</h3>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          defaultLanguage="html"
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
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true
            },
            parameterHints: {
              enabled: true
            }
          }}
          theme="vs"
        />
      </div>
    </div>
  );
};
