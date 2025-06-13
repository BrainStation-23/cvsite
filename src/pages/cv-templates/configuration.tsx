import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import FieldDisplayConfigTab from '@/components/admin/cv-templates/config/FieldDisplayConfigTab';
import SectionTableMappingsTab from '@/components/admin/cv-templates/config/SectionTableMappingsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

const CVTemplatesConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('field-display');
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/cv-templates')} className="mr-4 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Templates
          </Button>
          <h1 className="text-3xl font-bold">CV Templates Configuration</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="field-display">Field Display Config</TabsTrigger>
            <TabsTrigger value="section-mappings">Section Table Mappings</TabsTrigger>
          </TabsList>
          <div className="mt-4 min-h-[60vh] bg-white rounded shadow p-6">
            <TabsContent value="field-display">
              <FieldDisplayConfigTab />
            </TabsContent>
            <TabsContent value="section-mappings">
              <SectionTableMappingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplatesConfigurationPage;
