
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { AddResourceAssignmentDialog } from './AddResourceAssignmentDialog';
import { ResourcePlanningSearchControls } from './ResourcePlanningSearchControls';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { ResourcePlanningTableRow } from './ResourcePlanningTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';

export const ResourcePlanningTable: React.FC = () => {
  const {
    data,
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
  } = useResourcePlanning();

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
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
          <AddResourceAssignmentDialog />
        </div>
        <ResourcePlanningSearchControls 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
