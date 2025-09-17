import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus } from 'lucide-react';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import { useBenchBillTypes } from '@/hooks/use-bench-bill-types';
import NonBilledSyncScheduling from '@/components/admin/NonBilledSyncScheduling';

export const BenchSettings: React.FC = () => {
  const [selectedBillType, setSelectedBillType] = useState<string | null>(null);
  const {
    benchBillTypes,
    isLoading,
    addBenchBillType,
    removeBenchBillType,
    isAddingBenchBillType,
    isRemovingBenchBillType,
  } = useBenchBillTypes();

  const handleAddBillType = () => {
    if (selectedBillType) {
      addBenchBillType(selectedBillType);
      setSelectedBillType(null);
    }
  };

  const handleRemoveBillType = (id: string) => {
    removeBenchBillType(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Non-Billed Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure non-billed resources management, bench settings, and automation
          </p>
        </div>
      </div>

      <Tabs defaultValue="bench-settings" className="flex flex-col h-full">
        {/* Fixed header with tabs */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-0">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 border-b-0">
            <TabsTrigger 
              value="bench-settings" 
              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
            >
              Bench Bill Types
            </TabsTrigger>
            <TabsTrigger 
              value="sync-scheduling" 
              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-cvsite-teal data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 font-medium"
            >
              Sync Scheduling
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-1 min-h-0">
          <TabsContent value="bench-settings" className="mt-0 h-full">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bench Bill Types</CardTitle>
                    <CardDescription>
                      Manage bill types that can be used for bench resources. These bill types will be available when managing bench allocations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add new bill type */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">
                          Add Bill Type
                        </label>
                        <BillTypeCombobox
                          value={selectedBillType}
                          onValueChange={setSelectedBillType}
                          placeholder="Select a bill type to add..."
                          disabled={isAddingBenchBillType}
                        />
                      </div>
                      <Button
                        onClick={handleAddBillType}
                        disabled={!selectedBillType || isAddingBenchBillType}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Current bench bill types */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Current Bench Bill Types</h4>
                      
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          Loading bench bill types...
                        </div>
                      ) : benchBillTypes.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          No bench bill types configured yet.
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {benchBillTypes.map((benchBillType) => (
                            <div
                              key={benchBillType.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-card"
                            >
                              <div className="flex items-center gap-3">
                                {benchBillType.bill_types && (
                                  <>
                                    <div
                                      className="w-4 h-4 rounded-sm border"
                                      style={{ backgroundColor: benchBillType.bill_types.color_code }}
                                    />
                                    <Badge variant="outline">
                                      {benchBillType.bill_types.name}
                                    </Badge>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBillType(benchBillType.id)}
                                disabled={isRemovingBenchBillType}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="sync-scheduling" className="mt-0 h-full">
            <ScrollArea className="h-full">
              <div className="p-6">
                <NonBilledSyncScheduling />
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default BenchSettings;
