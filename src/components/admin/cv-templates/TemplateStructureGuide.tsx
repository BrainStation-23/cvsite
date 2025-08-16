
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';

interface TemplateStructureGuideProps {
  onInsertExample?: (html: string) => void;
}

export const TemplateStructureGuide: React.FC<TemplateStructureGuideProps> = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleOpenDocumentation = () => {
    navigate('/admin/cv-templates/documentation');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">CSS Classes</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenDocumentation}
            className="text-xs"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Documentation
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Page Break Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(CV_TEMPLATE_STANDARDS.PAGE_BREAK_CLASSES).map(([className, description]) => (
              <div key={className} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <div className="flex-1">
                  <code className="font-mono bg-gray-200 px-2 py-1 rounded">.{className}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(className, className)}
                  className="h-6 w-6 p-0"
                >
                  {copiedItem === className ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(CV_TEMPLATE_STANDARDS.SECTION_CLASSES).map(([className, description]) => (
              <div key={className} className="flex items-center justify-between p-2 bg-blue-50 rounded text-xs">
                <div className="flex-1">
                  <code className="font-mono bg-blue-200 px-2 py-1 rounded">.{className}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(className, className)}
                  className="h-6 w-6 p-0"
                >
                  {copiedItem === className ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Item Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(CV_TEMPLATE_STANDARDS.ITEM_CLASSES).map(([className, description]) => (
              <div key={className} className="flex items-center justify-between p-2 bg-green-50 rounded text-xs">
                <div className="flex-1">
                  <code className="font-mono bg-green-200 px-2 py-1 rounded">.{className}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(className, className)}
                  className="h-6 w-6 p-0"
                >
                  {copiedItem === className ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
