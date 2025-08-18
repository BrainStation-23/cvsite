
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReferenceSettings from '@/components/admin/reference/ReferenceSettings';
import { PlaceholderImageSettings } from '@/components/admin/placeholder-images/PlaceholderImageSettings';

const CVTemplateSettings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/platform-settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Platform Settings
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              CV Template Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure references, placeholder images, and other settings related to CV template generation.
            </p>
          </div>
        </div>

        {/* Content area with tabs */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <Tabs defaultValue="references" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="references">References</TabsTrigger>
                  <TabsTrigger value="placeholder-images">Placeholder Images</TabsTrigger>
                </TabsList>
                
                <TabsContent value="references" className="space-y-6">
                  <ReferenceSettings />
                </TabsContent>
                
                <TabsContent value="placeholder-images" className="space-y-6">
                  <PlaceholderImageSettings />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateSettings;
