
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { STRUCTURE_EXAMPLES } from '@/constants/cv-template-examples';

export const ExamplesSection: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Basic Structure</h4>
          <div className="relative">
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96 border">
              <code>{STRUCTURE_EXAMPLES.basic}</code>
            </pre>
            <Button
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(STRUCTURE_EXAMPLES.basic, 'basic')}
            >
              {copiedItem === 'basic' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Advanced Structure</h4>
          <div className="relative">
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96 border">
              <code>{STRUCTURE_EXAMPLES.advanced}</code>
            </pre>
            <Button
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(STRUCTURE_EXAMPLES.advanced, 'advanced')}
            >
              {copiedItem === 'advanced' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
