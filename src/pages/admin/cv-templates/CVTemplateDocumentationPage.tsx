
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StructureSection } from '@/components/admin/cv-templates/documentation/StructureSection';
import { ExamplesSection } from '@/components/admin/cv-templates/documentation/ExamplesSection';
import { ValidationSection } from '@/components/admin/cv-templates/documentation/ValidationSection';

const CVTemplateDocumentationPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CV Template Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive guide for creating and managing CV templates
          </p>
        </div>

        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="structure">HTML Structure</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            <StructureSection />
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <ExamplesSection />
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <ValidationSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateDocumentationPage;
