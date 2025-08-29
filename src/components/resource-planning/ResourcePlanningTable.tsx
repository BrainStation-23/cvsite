
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlannedResourcesTab } from './PlannedResourcesTab';
import { WeeklyValidationTab } from './WeeklyValidationTab';
import { ResourcePlanningForm } from './ResourcePlanningForm';
import { ResourcePlanningExportButton } from './ResourcePlanningExportButton';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { useResourcePlanningState } from './hooks/useResourcePlanningState';
import { useInlineEdit } from './hooks/useInlineEdit';

export const ResourcePlanningTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('planned');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    preselectedProfileId,
    editingItem,
    handleCreatePlan,
    handleCreateNewAssignment,
    handleEditAssignment,
    handleFormSuccess,
    handleFormCancel,
  } = useResourcePlanningState();

  const {
    editingItemId,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
    isLoading: editLoading,
  } = useInlineEdit();

  const showForm = preselectedProfileId !== null || editingItem !== null;

  const handleCloseForm = () => {
    handleFormCancel();
  };

  return (
    <div className="space-y-6">
      <ResourcePlanningSearchControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
                    selectedSbu={null}
                    selectedManager={null}
                    onCreateNewAssignment={handleCreateNewAssignment}
                    onEditAssignment={handleEditAssignment}
                    resourcePlanningState={{
                      data: [],
                      pagination: null,
                      isLoading: false,
                      currentPage: 1,
                      setCurrentPage: () => {},
                      sortBy: 'created_at',
                      setSortBy: () => {},
                      sortOrder: 'desc',
                      setSortOrder: () => {},
                      refetch: () => {},
                    }}
                    editingItemId={editingItemId}
                    editData={editData}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onEditDataChange={updateEditData}
                    editLoading={editLoading}
                  />
                </TabsContent>

                <TabsContent value="validation" className="mt-4">
                  <WeeklyValidationTab
                    searchQuery={searchQuery}
                    selectedSbu={null}
                    selectedManager={null}
                    resourcePlanningState={{
                      data: [],
                      pagination: null,
                      isLoading: false,
                      currentPage: 1,
                      setCurrentPage: () => {},
                      sortBy: 'created_at',
                      setSortBy: () => {},
                      sortOrder: 'desc',
                      setSortOrder: () => {},
                      refetch: () => {},
                      validateWeekly: () => {},
                      isValidating: false,
                      bulkValidate: () => {},
                      bulkComplete: () => {},
                      bulkDelete: () => {},
                      bulkCopy: () => {},
                      isBulkValidating: false,
                      isBulkCompleting: false,
                      isBulkDeleting: false,
                      isBulkCopying: false,
                    }}
                    editingItemId={editingItemId}
                    editData={editData}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onEditDataChange={updateEditData}
                    editLoading={editLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {showForm && (
            <ResourcePlanningForm 
              preselectedProfileId={preselectedProfileId}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};
