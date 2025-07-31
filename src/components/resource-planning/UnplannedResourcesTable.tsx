
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';

interface Profile {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
}

interface UnplannedResource {
  id: string;
  profile_id: string;
  profile: Profile;
}

interface UnplannedResourcesTableProps {
  resources: UnplannedResource[];
  pagination?: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-muted-foreground">Loading unplanned resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No unplanned resources found.
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.profile.employee_id}</TableCell>
                  <TableCell>
                    {resource.profile.first_name} {resource.profile.last_name}
                  </TableCell>
                  <TableCell>{resource.profile.current_designation || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => onCreatePlan(resource.profile_id)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Plan
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
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
