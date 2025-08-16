
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { STRUCTURE_EXAMPLES } from '@/constants/cv-template-examples';

interface ExamplesSectionProps {
  onInsertExample?: (html: string) => void;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({ onInsertExample }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Template copied to clipboard');
  };

  const downloadTemplate = (template: string, filename: string) => {
    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Template Examples</h2>
        <p className="text-muted-foreground mb-6">
          Ready-to-use CV template examples with different layouts and styling approaches.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Comprehensive Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Comprehensive CV Template
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(STRUCTURE_EXAMPLES.comprehensive)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadTemplate(STRUCTURE_EXAMPLES.comprehensive, 'comprehensive-cv-template')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {onInsertExample && (
                  <Button
                    size="sm"
                    onClick={() => onInsertExample(STRUCTURE_EXAMPLES.comprehensive)}
                  >
                    Insert Template
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              A complete, professional CV template with sidebar layout, timeline experience section, 
              skill bars, star ratings for English skills, and comprehensive styling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Features included:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Two-column layout with sidebar</li>
                <li>• Profile image with styling</li>
                <li>• Skill bars for technical skills</li>
                <li>• Star ratings for English skills</li>
                <li>• Timeline-style experience section</li>
                <li>• Numbered project list</li>
                <li>• Complete CSS styling with Google Fonts</li>
                <li>• Responsive design elements</li>
                <li>• Professional color scheme</li>
              </ul>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm">View Code Preview</summary>
              <pre className="text-xs bg-slate-50 p-3 rounded mt-2 overflow-x-auto">
{STRUCTURE_EXAMPLES.comprehensive.substring(0, 500)}...
              </pre>
            </details>
          </CardContent>
        </Card>

        {/* Basic Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Basic CV Template
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(STRUCTURE_EXAMPLES.basic)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadTemplate(STRUCTURE_EXAMPLES.basic, 'basic-cv-template')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {onInsertExample && (
                  <Button
                    size="sm"
                    onClick={() => onInsertExample(STRUCTURE_EXAMPLES.basic)}
                  >
                    Insert Template
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              A simple, minimal CV template structure for quick customization. Uses standard CV classes for easy styling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Features included:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Clean, minimal structure</li>
                <li>• Standard CV CSS classes</li>
                <li>• Header, summary, and experience sections</li>
                <li>• Page break control classes</li>
                <li>• Easy to customize and extend</li>
              </ul>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm">View Code Preview</summary>
              <pre className="text-xs bg-slate-50 p-3 rounded mt-2 overflow-x-auto">
{STRUCTURE_EXAMPLES.basic}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Template Usage Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The comprehensive template includes complete HTML with head, body, and embedded CSS</li>
          <li>• The basic template provides just the body structure for integration with existing styles</li>
          <li>• All templates use Handlebars syntax for dynamic content</li>
          <li>• You can mix and match sections from different templates</li>
          <li>• Remember to test with real employee data to ensure proper rendering</li>
        </ul>
      </div>
    </div>
  );
};
