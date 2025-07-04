
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SbuSettings from '@/components/admin/SbuSettings';
import HrContactSettings from '@/components/admin/HrContactSettings';
import NoteCategorySettings from '@/components/admin/NoteCategorySettings';

const SystemConfigurationSettings: React.FC = () => {
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
              System Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure system-wide settings including SBUs, HR contacts, and note categories.
            </p>
          </div>
        </div>

        <Tabs defaultValue="sbus" className="flex flex-col h-full">
          {/* Fixed header with tabs */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-0">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b-0">
              <TabsTrigger 
                value="sbus" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                SBUs
              </TabsTrigger>
              <TabsTrigger 
                value="hr-contacts" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                HR Contacts
              </TabsTrigger>
              <TabsTrigger 
                value="note-categories" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
              >
                Note Categories
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 min-h-0">
            <TabsContent value="sbus" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <SbuSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="hr-contacts" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <HrContactSettings />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="note-categories" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <NoteCategorySettings />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SystemConfigurationSettings;

