
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlatformSettings as PlatformSettingsType } from '../../types';
import { Spinner } from '@/components/ui/spinner';

// Define the shape of a setting from the database
interface PlatformSetting {
  id: string;
  category: string;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

const PlatformSettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newItem, setNewItem] = useState({
    university: '',
    department: '',
    degree: '',
    designation: '',
    reference: '',
    sbu: ''
  });
  
  // Fetch all platform settings
  const { data: platformSettingsData, isLoading, error } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      // Using the edge function to fetch settings
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/list-settings`, {
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch settings');
      }
      
      const data = await response.json();
      console.log("Settings data fetched:", data); // Debug log
      return data as PlatformSetting[];
    },
  });
  
  // Group settings by category
  const [settings, setSettings] = useState<PlatformSettingsType>({
    universities: [],
    departments: [],
    degrees: [],
    designations: [],
    references: [],
    sbus: []
  });
  
  useEffect(() => {
    if (platformSettingsData) {
      const groupedSettings: PlatformSettingsType = {
        universities: [],
        departments: [],
        degrees: [],
        designations: [],
        references: [],
        sbus: []
      };
      
      platformSettingsData.forEach(setting => {
        const category = setting.category + 's' as keyof PlatformSettingsType;
        if (category in groupedSettings) {
          // Only add the value if it doesn't already exist
          if (!groupedSettings[category].includes(setting.value)) {
            groupedSettings[category].push(setting.value);
          }
        }
      });
      
      setSettings(groupedSettings);
    }
  }, [platformSettingsData]);
  
  // Add setting mutation
  const addSettingMutation = useMutation({
    mutationFn: async ({ category, name, value }: { category: string, name: string, value: string }) => {
      const singularCategory = category.endsWith('s') ? category.slice(0, -1) : category;
      
      const { data, error } = await supabase.rpc(
        'update_platform_setting',
        { 
          p_category: singularCategory, 
          p_name: value, 
          p_value: value 
        }
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
    },
  });
  
  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async ({ category, name }: { category: string, name: string }) => {
      const singularCategory = category.endsWith('s') ? category.slice(0, -1) : category;
      
      const { data, error } = await supabase.rpc(
        'delete_platform_setting',
        { 
          p_category: singularCategory, 
          p_name: name 
        }
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
    },
  });
  
  const addItem = (category: keyof PlatformSettingsType, value: string) => {
    if (!value.trim()) return;
    
    // Perform the mutation
    addSettingMutation.mutate(
      { 
        category, 
        name: value.trim(), 
        value: value.trim() 
      },
      {
        onSuccess: () => {
          // Update local state for immediate UI feedback
          setSettings({
            ...settings,
            [category]: [...settings[category], value.trim()]
          });
          
          // Reset the input
          setNewItem({
            ...newItem,
            [category.endsWith('s') ? category.slice(0, -1) : category]: ''
          });
          
          toast({
            title: "Item added",
            description: `"${value}" has been added to ${category}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    );
  };
  
  const removeItem = (category: keyof PlatformSettingsType, index: number) => {
    const itemToRemove = settings[category][index];
    
    // Perform the mutation
    deleteSettingMutation.mutate(
      { 
        category, 
        name: itemToRemove 
      },
      {
        onSuccess: () => {
          // Update local state for immediate UI feedback
          const updatedItems = [...settings[category]];
          updatedItems.splice(index, 1);
          
          setSettings({
            ...settings,
            [category]: updatedItems
          });
          
          toast({
            title: "Item removed",
            description: `"${itemToRemove}" has been removed from ${category}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    );
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
            disabled={addSettingMutation.isPending}
          >
            {addSettingMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : (
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
                  disabled={deleteSettingMutation.isPending}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500">
          <p>Error loading settings: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['platformSettings'] })}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
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
