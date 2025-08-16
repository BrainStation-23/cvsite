
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Info, AlertTriangle } from 'lucide-react';
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';

interface TemplateStructureGuideProps {
  onInsertExample?: (html: string) => void;
}

export const TemplateStructureGuide: React.FC<TemplateStructureGuideProps> = ({
  onInsertExample
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const structureExamples = {
    basic: `<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <h1 class="cv-section-header">{{employee.firstName}} {{employee.lastName}}</h1>
    <div class="cv-section-content">
      <p>{{employee.email}} | {{employee.currentDesignation}}</p>
    </div>
  </section>
  
  <section class="cv-section cv-page-break-avoid" data-section="summary">
    <h2 class="cv-section-header">Professional Summary</h2>
    <div class="cv-section-content">
      <p>{{employee.biography}}</p>
    </div>
  </section>
  
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Work Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid">
        <h3 class="cv-item-header">{{this.designation}} at {{this.companyName}}</h3>
        <div class="cv-item-content">
          <p><strong>{{this.startDate | formatDate}} - {{#if this.isCurrent}}Present{{else}}{{this.endDate | formatDate}}{{/if}}</strong></p>
          <div>{{{this.description}}}</div>
        </div>
      </div>
      {{/each}}
    </div>
  </section>
</div>`,

    advanced: `<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <div class="cv-item">
      <h1 class="cv-item-header">{{employee.firstName}} {{employee.lastName}}</h1>
      <div class="cv-item-content">
        <p>{{employee.email}} | {{employee.currentDesignation}}</p>
      </div>
    </div>
  </section>
  
  <!-- Force page break before main content -->
  <div class="cv-page-break-before"></div>
  
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Professional Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid" data-item="experience-{{@index}}">
        <div class="cv-item-header">
          <h3>{{this.designation}}</h3>
          <h4>{{this.companyName}}</h4>
        </div>
        <div class="cv-item-content">
          <p class="cv-page-break-after"><strong>{{this.dateRange}}</strong></p>
          <div>{{{this.description}}}</div>
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  
  <section class="cv-section" data-section="skills">
    <h2 class="cv-section-header">Technical Skills</h2>
    <div class="cv-item-group">
      {{#each employee.technicalSkills}}
      <div class="cv-item" data-item="skill-{{@index}}">
        <span class="cv-item-header">{{this.name}}</span>
        <span class="cv-item-content"> - {{this.proficiency}}/10</span>
      </div>
      {{/each}}
    </div>
  </section>
</div>`
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <h3 className="font-medium text-sm">Template Structure Guide</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classes">CSS Classes</TabsTrigger>
            <TabsTrigger value="structure">HTML Structure</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Page Break Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Section Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Structure</h4>
                  <div className="relative">
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                      <code>{structureExamples.basic}</code>
                    </pre>
                    <Button
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        copyToClipboard(structureExamples.basic, 'basic');
                        onInsertExample?.(structureExamples.basic);
                      }}
                    >
                      {copiedItem === 'basic' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Advanced Structure</h4>
                  <div className="relative">
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                      <code>{structureExamples.advanced}</code>
                    </pre>
                    <Button
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        copyToClipboard(structureExamples.advanced, 'advanced');
                        onInsertExample?.(structureExamples.advanced);
                      }}
                    >
                      {copiedItem === 'advanced' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Validation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Required Elements</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>✓ Root <code>.cv-container</code> element</li>
                      <li>✓ At least one <code>.cv-section</code> with <code>data-section</code></li>
                      <li>✓ Section headers use <code>.cv-section-header</code></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Recommended Practices</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Use <code>.cv-page-break-avoid</code> on important sections</li>
                      <li>• Wrap related items in <code>.cv-item-group</code></li>
                      <li>• Add <code>data-item</code> attributes for tracking</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h4 className="text-sm font-medium text-green-800 mb-2">PDF Optimization Tips</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Use <code>.cv-page-break-before</code> to force new pages</li>
                      <li>• Avoid splitting individual <code>.cv-item</code> elements</li>
                      <li>• Keep headers with their content using <code>page-break-after: avoid</code></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
