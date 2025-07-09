
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { ResourceAssignmentDialog } from './ResourceAssignmentDialog';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { ResourcePlanningTableRow } from './ResourcePlanningTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';
import { ResourcePlanningFilters } from './ResourcePlanningFilters';
import { UnplannedResourcesTable } from './UnplannedResourcesTable';

export const ResourcePlanningTable: React.FC = () => {
  const {
    data,
    unplannedResources,
    pagination,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedSbu,
    setSelectedSbu,
    selectedManager,
    setSelectedManager,
    showUnplanned,
    setShowUnplanned,
    clearFilters,
  } = useResourcePlanning();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [preselectedProfileId, setPreselectedProfileId] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCreatePlan = (profileId: string) => {
    setPreselectedProfileId(profileId);
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setPreselectedProfileId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading resource planning data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Planning</CardTitle>
          <ResourceAssignmentDialog 
            mode="create" 
            open={createDialogOpen}
            onOpenChange={handleDialogClose}
            preselectedProfileId={preselectedProfileId}
          />
        </div>
        
        <div className="space-y-4">
          <ResourcePlanningFilters
            selectedSbu={selectedSbu}
            onSbuChange={setSelectedSbu}
            selectedManager={selectedManager}
            onManagerChange={setSelectedManager}
            showUnplanned={showUnplanned}
            onShowUnplannedChange={setShowUnplanned}
            onClearFilters={clearFilters}
          />
          
          <ResourcePlanningSearchControls 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={showUnplanned ? "unplanned" : "planned"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="planned" 
              onClick={() => setShowUnplanned(false)}
            >
              Planned Resources ({data.length})
            </TabsTrigger>
            <TabsTrigger 
              value="unplanned" 
              onClick={() => setShowUnplanned(true)}
            >
              Unplanned Resources ({unplannedResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planned" className="mt-4">
            {data.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No resource planning entries found. Create your first assignment to get started.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <ResourcePlanningTableHeader 
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <TableBody>
                      {data.map((item) => (
                        <ResourcePlanningTableRow key={item.id} item={item} />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ResourcePlanningPagination 
                  pagination={pagination}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="unplanned" className="mt-4">
            <UnplannedResourcesTable 
              resources={unplannedResources}
              onCreatePlan={handleCreatePlan}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
