
import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlatformSettings as PlatformSettingsType } from '../../types';

const PlatformSettings: React.FC = () => {
  const { toast } = useToast();
  
  // Sample platform settings data - would come from Supabase in a real app
  const [settings, setSettings] = useState<PlatformSettingsType>({
    universities: ['Harvard University', 'MIT', 'Stanford University'],
    departments: ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance'],
    degrees: ['Bachelor of Science', 'Master of Science', 'PhD', 'MBA'],
    designations: ['Software Engineer', 'Project Manager', 'Product Manager', 'UX Designer'],
    references: ['Internal Project', 'Client Project', 'Research'],
    sbus: ['Technology', 'Healthcare', 'Finance', 'Retail']
  });
  
  const [newItem, setNewItem] = useState({
    university: '',
    department: '',
    degree: '',
    designation: '',
    reference: '',
    sbu: ''
  });
  
  const addItem = (category: keyof PlatformSettingsType, value: string) => {
    if (!value.trim()) return;
    
    setSettings({
      ...settings,
      [category]: [...settings[category], value.trim()]
    });
    
    setNewItem({
      ...newItem,
      [category]: ''
    });
    
    toast({
      title: "Item added",
      description: `"${value}" has been added to ${category}.`,
    });
  };
  
  const removeItem = (category: keyof PlatformSettingsType, index: number) => {
    const updatedItems = [...settings[category]];
    updatedItems.splice(index, 1);
    
    setSettings({
      ...settings,
      [category]: updatedItems
    });
    
    toast({
      title: "Item removed",
      description: `Item has been removed from ${category}.`,
    });
  };
  
  // Helper function to render setting items
  const renderSettingItems = (
    category: keyof PlatformSettingsType,
    title: string,
    inputName: keyof typeof newItem
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input 
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
            value={newItem[inputName]}
            onChange={(e) => setNewItem({...newItem, [inputName]: e.target.value})}
            className="mr-2"
          />
          <Button 
            onClick={() => addItem(category, newItem[inputName])}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings[category].map((item, index) => (
            <div 
              key={index} 
              className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md"
            >
              <span>{item}</span>
              <button 
                onClick={() => removeItem(category, index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
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
          {renderSettingItems('universities', 'Universities', 'university')}
        </TabsContent>
        
        <TabsContent value="departments">
          {renderSettingItems('departments', 'Departments', 'department')}
        </TabsContent>
        
        <TabsContent value="degrees">
          {renderSettingItems('degrees', 'Degrees', 'degree')}
        </TabsContent>
        
        <TabsContent value="designations">
          {renderSettingItems('designations', 'Designations', 'designation')}
        </TabsContent>
        
        <TabsContent value="references">
          {renderSettingItems('references', 'References', 'reference')}
        </TabsContent>
        
        <TabsContent value="sbus">
          {renderSettingItems('sbus', 'SBUs', 'sbu')}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PlatformSettings;
