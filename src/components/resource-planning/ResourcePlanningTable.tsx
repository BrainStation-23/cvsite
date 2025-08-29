import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { WeeklyValidationTab } from './WeeklyValidationTab';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { ResourcePlanningExportButton } from './ResourcePlanningExportButton';
import { useResourcePlanningSearch } from '@/hooks/use-resource-planning-search';
import { useResourcePlanningInlineEdit } from '@/hooks/use-resource-planning-inline-edit';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { useResourcePlanningOperations } from '@/hooks/use-resource-planning-operations';
import { useResourcePlanningState } from '@/hooks/use-resource-planning-state';

export const ResourcePlanningTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('planned');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const {
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
  } = useResourcePlanningSearch();

  const {
    editingItemId,
    editData,
    editLoading,
    startEdit,
    cancelEdit,
    saveEdit,
    setEditData,
  } = useResourcePlanningInlineEdit();

  const {
    createResourcePlanning,
    updateResourcePlanning,
    invalidateResourcePlanning,
    deleteResourcePlanning,
    isCreating,
    isUpdating,
    isInvalidating,
    isDeleting,
  } = useResourcePlanningOperations();

  const {
    data,
    pagination,
    isLoading,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    refetch
  } = useResourcePlanningState(searchQuery, selectedSbu, selectedManager);

  const handleCreateNewAssignment = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditAssignment = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <ResourcePlanningSearchControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSbu={selectedSbu}
        setSelectedSbu={setSelectedSbu}
        selectedManager={selectedManager}
        setSelectedManager={setSelectedManager}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Resource Planning</CardTitle>
              <div className="flex items-center gap-2">
                <ResourcePlanningExportButton />
                <Button onClick={handleCreateNewAssignment} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="planned">Planned Resources</TabsTrigger>
                  <TabsTrigger value="validation">Weekly Validation</TabsTrigger>
                </TabsList>

                <TabsContent value="planned" className="mt-4">
                  <PlannedResourcesTab
                    searchQuery={searchQuery}
                    selectedSbu={selectedSbu}
                    selectedManager={selectedManager}
                    onCreateNewAssignment={handleCreateNewAssignment}
                    onEditAssignment={handleEditAssignment}
                    resourcePlanningState={{
                      data,
                      pagination,
                      isLoading,
                      currentPage,
                      setCurrentPage,
                      sortBy,
                      setSortBy,
                      sortOrder,
                      setSortOrder,
                      refetch
                    }}
                    editingItemId={editingItemId}
                    editData={editData}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onEditDataChange={setEditData}
                    editLoading={editLoading}
                  />
                </TabsContent>

                <TabsContent value="validation" className="mt-4">
                  <WeeklyValidationTab
                    searchQuery={searchQuery}
                    selectedSbu={selectedSbu}
                    selectedManager={selectedManager}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ResourcePlanningForm 
            isOpen={showForm}
            onClose={handleCloseForm}
            editingItem={editingItem}
          />
        </div>
      </div>
    </div>
  );
};
