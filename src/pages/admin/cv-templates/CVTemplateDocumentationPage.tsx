
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Code, BookOpen, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';
import { CV_TEMPLATE_EXAMPLES } from '@/constants/cv-template-examples';

const CVTemplateDocumentationPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState('professional');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CV Template Documentation</h1>
        <p className="text-muted-foreground">
          Complete guide for creating professional CV templates with proper page breaks and structure.
        </p>
      </div>

      <Tabs defaultValue="structure" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Structure Guide
          </TabsTrigger>
          <TabsTrigger value="css-classes" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            CSS Classes
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="best-practices" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Best Practices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required HTML Structure</CardTitle>
              <p className="text-sm text-muted-foreground">
                Follow this structure for consistent PDF generation and page breaks.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Basic Container Structure</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(CV_TEMPLATE_STANDARDS.htmlStructure.container)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{CV_TEMPLATE_STANDARDS.htmlStructure.container}</code>
                  </pre>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Section Structure</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(CV_TEMPLATE_STANDARDS.htmlStructure.section)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{CV_TEMPLATE_STANDARDS.htmlStructure.section}</code>
                  </pre>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Item Structure</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(CV_TEMPLATE_STANDARDS.htmlStructure.item)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{CV_TEMPLATE_STANDARDS.htmlStructure.item}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="css-classes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Break Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CV_TEMPLATE_STANDARDS.cssClasses.pageBreak.map((cssClass) => (
                  <div key={cssClass.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{cssClass.name}</code>
                        <Badge variant="outline">{cssClass.usage}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cssClass.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(cssClass.name)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CV_TEMPLATE_STANDARDS.cssClasses.layout.map((cssClass) => (
                  <div key={cssClass.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{cssClass.name}</code>
                        <Badge variant="outline">{cssClass.usage}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cssClass.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(cssClass.name)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(CV_TEMPLATE_EXAMPLES).map(([key, example]) => (
                    <Button
                      key={key}
                      variant={activeExample === key ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveExample(key)}
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{CV_TEMPLATE_EXAMPLES[activeExample]?.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {CV_TEMPLATE_EXAMPLES[activeExample]?.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(CV_TEMPLATE_EXAMPLES[activeExample]?.template || '')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <pre className="text-sm">
                    <code>{CV_TEMPLATE_EXAMPLES[activeExample]?.template}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Do's</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Use semantic section classes:</strong> Always wrap sections with <code>cv-section</code>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Include data-section attributes:</strong> Help with template validation and processing
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Use cv-item for groupable content:</strong> Work experience, projects, education items
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Test with long content:</strong> Ensure page breaks work with varying content lengths
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Don'ts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Don't use inline styles for page breaks:</strong> Use standardized CSS classes instead
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Don't create overly tall sections:</strong> Break up long content into smaller sections
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Don't ignore validation warnings:</strong> Fix structural issues before saving
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Don't nest cv-sections:</strong> Keep sections at the same level within cv-container
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <strong>Issue:</strong> Content gets cut off between pages<br />
                  <strong>Solution:</strong> Use <code>cv-page-break-avoid</code> on the containing element
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <strong>Issue:</strong> Headers appear alone on new pages<br />
                  <strong>Solution:</strong> Use <code>cv-section-header</code> class and ensure it's followed by content
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <strong>Issue:</strong> Lists break awkwardly<br />
                  <strong>Solution:</strong> Wrap list items in <code>cv-item</code> classes for better control
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CVTemplateDocumentationPage;
