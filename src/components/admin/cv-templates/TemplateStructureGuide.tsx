
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';
import { Link } from 'react-router-dom';

export const TemplateStructureGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">Template Structure</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Essential CSS classes for proper PDF generation
            </p>
          </div>
          <Link to="/admin/cv-templates/documentation">
            <Button size="sm" variant="outline">
              <ExternalLink className="h-3 w-3 mr-1" />
              Full Docs
            </Button>
          </Link>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Page Break Classes */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Page Break Control</h4>
            <div className="space-y-2">
              {CV_TEMPLATE_STANDARDS.cssClasses.pageBreak.slice(0, 4).map((cssClass) => (
                <div key={cssClass.name} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{cssClass.name}</code>
                      <Badge variant="outline" className="text-xs">{cssClass.usage}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cssClass.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(cssClass.name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Classes */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Layout Structure</h4>
            <div className="space-y-2">
              {CV_TEMPLATE_STANDARDS.cssClasses.layout.slice(0, 6).map((cssClass) => (
                <div key={cssClass.name} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{cssClass.name}</code>
                      <Badge variant="outline" className="text-xs">{cssClass.usage}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cssClass.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(cssClass.name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Start</h4>
            <div className="space-y-2 text-xs text-blue-600">
              <p>1. Wrap your template in <code>cv-container</code></p>
              <p>2. Use <code>cv-section</code> for major sections</p>
              <p>3. Use <code>cv-item</code> for individual entries</p>
              <p>4. Add <code>cv-page-break-avoid</code> to prevent cuts</p>
            </div>
            <Link to="/admin/cv-templates/documentation">
              <Button size="sm" className="mt-2 w-full" variant="outline">
                View Complete Documentation
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
