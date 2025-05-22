
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import SettingCategory from '@/components/admin/SettingCategory';

const PlatformSettings: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6 text-cvsite-navy dark:text-white">Platform Settings</h1>
      
      <Tabs defaultValue="universities" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="universities">Universities</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="degrees">Degrees</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="sbus">SBUs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="universities">
          <SettingCategory title="Universities" table="universities" />
        </TabsContent>
        
        <TabsContent value="departments">
          <SettingCategory title="Departments" table="departments" />
        </TabsContent>
        
        <TabsContent value="degrees">
          <SettingCategory title="Degrees" table="degrees" />
        </TabsContent>
        
        <TabsContent value="designations">
          <SettingCategory title="Designations" table="designations" />
        </TabsContent>
        
        <TabsContent value="references">
          <SettingCategory title="References" table="references" />
        </TabsContent>
        
        <TabsContent value="sbus">
          <SettingCategory title="SBUs" table="sbus" />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PlatformSettings;
