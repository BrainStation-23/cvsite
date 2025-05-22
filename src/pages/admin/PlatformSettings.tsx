
import React, { useState } from 'react';
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
interface SettingItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Define valid table names for type safety
type SettingTableName = 'universities' | 'departments' | 'degrees' | 'designations' | 'references' | 'sbus';

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
  
  // Fetch data from each table
  const fetchSettings = async (table: SettingTableName) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('name');
    
    if (error) throw error;
    console.log(`${table} data fetched:`, data);
    return data as SettingItem[];
  };
  
  // Use separate queries for each category
  const { 
    data: universities, 
    isLoading: isLoadingUniversities 
  } = useQuery({
    queryKey: ['universities'],
    queryFn: () => fetchSettings('universities'),
  });
  
  const { 
    data: departments, 
    isLoading: isLoadingDepartments 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchSettings('departments'),
  });
  
  const { 
    data: degrees, 
    isLoading: isLoadingDegrees 
  } = useQuery({
    queryKey: ['degrees'],
    queryFn: () => fetchSettings('degrees'),
  });
  
  const { 
    data: designations, 
    isLoading: isLoadingDesignations 
  } = useQuery({
    queryKey: ['designations'],
    queryFn: () => fetchSettings('designations'),
  });
  
  const { 
    data: references, 
    isLoading: isLoadingReferences 
  } = useQuery({
    queryKey: ['references'],
    queryFn: () => fetchSettings('references'),
  });
  
  const { 
    data: sbus, 
    isLoading: isLoadingSbus 
  } = useQuery({
    queryKey: ['sbus'],
    queryFn: () => fetchSettings('sbus'),
  });
  
  // Combined loading state
  const isLoading = 
    isLoadingUniversities || 
    isLoadingDepartments || 
    isLoadingDegrees || 
    isLoadingDesignations || 
    isLoadingReferences || 
    isLoadingSbus;
  
  // Group settings for the UI
  const settings: PlatformSettingsType = {
    universities: universities?.map(item => item.name) || [],
    departments: departments?.map(item => item.name) || [],
    degrees: degrees?.map(item => item.name) || [],
    designations: designations?.map(item => item.name) || [],
    references: references?.map(item => item.name) || [],
    sbus: sbus?.map(item => item.name) || []
  };
  
  // Add setting mutation
  const addSettingMutation = useMutation({
    mutationFn: async ({ table, name }: { table: SettingTableName, name: string }) => {
      const { data, error } = await supabase
        .from(table)
        .insert({ name })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.table] });
    },
  });
  
  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async ({ table, id }: { table: SettingTableName, id: string }) => {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.table] });
    },
  });
  
  const addItem = (table: SettingTableName, category: keyof PlatformSettingsType, value: string) => {
    if (!value.trim()) return;
    
    // Perform the mutation
    addSettingMutation.mutate(
      { 
        table, 
        name: value.trim() 
      },
      {
        onSuccess: () => {
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
  
  const removeItem = (table: SettingTableName, categoryItems: SettingItem[] | undefined, itemName: string) => {
    if (!categoryItems) return;
    
    const itemToRemove = categoryItems.find(item => item.name === itemName);
    if (!itemToRemove) return;
    
    // Perform the mutation
    deleteSettingMutation.mutate(
      { 
        table, 
        id: itemToRemove.id
      },
      {
        onSuccess: () => {
          toast({
            title: "Item removed",
            description: `"${itemName}" has been removed.`,
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
    table: SettingTableName,
    category: keyof PlatformSettingsType,
    title: string,
    inputName: keyof typeof newItem,
    items: SettingItem[] | undefined,
    isLoadingItems: boolean
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
            onClick={() => addItem(table, category, newItem[inputName])}
            disabled={addSettingMutation.isPending}
          >
            {addSettingMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
        {isLoadingItems ? (
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
                  onClick={() => removeItem(table, items, item)}
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
  
  // Handle general loading errors
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner />
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
          {renderSettingItems('universities', 'universities', 'Universities', 'university', universities, isLoadingUniversities)}
        </TabsContent>
        
        <TabsContent value="departments">
          {renderSettingItems('departments', 'departments', 'Departments', 'department', departments, isLoadingDepartments)}
        </TabsContent>
        
        <TabsContent value="degrees">
          {renderSettingItems('degrees', 'degrees', 'Degrees', 'degree', degrees, isLoadingDegrees)}
        </TabsContent>
        
        <TabsContent value="designations">
          {renderSettingItems('designations', 'designations', 'Designations', 'designation', designations, isLoadingDesignations)}
        </TabsContent>
        
        <TabsContent value="references">
          {renderSettingItems('references', 'references', 'References', 'reference', references, isLoadingReferences)}
        </TabsContent>
        
        <TabsContent value="sbus">
          {renderSettingItems('sbus', 'sbus', 'SBUs', 'sbu', sbus, isLoadingSbus)}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PlatformSettings;
