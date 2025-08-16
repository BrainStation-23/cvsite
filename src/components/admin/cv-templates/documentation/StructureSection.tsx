
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';

export const StructureSection: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Required HTML Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Requirements</h4>
                <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                  <li>• All templates must use <code>.cv-container</code> as the root element</li>
                  <li>• Each section must have <code>data-section</code> attribute</li>
                  <li>• Use <code>.cv-page-break-avoid</code> for content that shouldn't split</li>
                  <li>• Headers should always use <code>.cv-section-header</code> or <code>.cv-item-header</code></li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Section Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {CV_TEMPLATE_STANDARDS.SECTION_TYPES.map((type) => (
                <code key={type} className="text-xs bg-gray-100 px-2 py-1 rounded">data-section="{type}"</code>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">CSS Classes Reference</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Page Break Control</h5>
                <div className="space-y-2">
                  {Object.entries(CV_TEMPLATE_STANDARDS.PAGE_BREAK_CLASSES).map(([className, description]) => (
                    <div key={className} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">.{className}</code>
                        <p className="text-xs text-gray-600 mt-1">{description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(className, className)}
                      >
                        {copiedItem === className ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Section Classes</h5>
                <div className="space-y-2">
                  {Object.entries(CV_TEMPLATE_STANDARDS.SECTION_CLASSES).map(([className, description]) => (
                    <div key={className} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <code className="text-sm font-mono bg-blue-200 px-2 py-1 rounded">.{className}</code>
                        <p className="text-xs text-gray-600 mt-1">{description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(className, className)}
                      >
                        {copiedItem === className ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Item Classes</h5>
                <div className="space-y-2">
                  {Object.entries(CV_TEMPLATE_STANDARDS.ITEM_CLASSES).map(([className, description]) => (
                    <div key={className} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <code className="text-sm font-mono bg-green-200 px-2 py-1 rounded">.{className}</code>
                        <p className="text-xs text-gray-600 mt-1">{description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(className, className)}
                      >
                        {copiedItem === className ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
