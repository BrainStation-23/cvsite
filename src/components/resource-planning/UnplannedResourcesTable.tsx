
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';

interface UnplannedResource {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
  sbu_name: string;
  manager_name: string;
}

interface PaginationData {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface UnplannedResourcesTableProps {
  resources: UnplannedResource[];
  pagination?: PaginationData;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  onCreatePlan: (profileId: string) => void;
}

export const UnplannedResourcesTable: React.FC<UnplannedResourcesTableProps> = ({
  resources,
  pagination,
  currentPage,
  setCurrentPage,
  isLoading,
  onCreatePlan,
}) => {
  // Ensure resources is always an array
  const safeResources = Array.isArray(resources) ? resources : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  if (safeResources.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No unplanned resources found with the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {resource.first_name} {resource.last_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ID: {resource.employee_id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {resource.current_designation}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {resource.sbu_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {resource.manager_name}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onCreatePlan(resource.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Plan
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <ResourcePlanningPagination 
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};
