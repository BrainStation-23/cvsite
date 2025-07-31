
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResourcePlanningTableRow } from './ResourcePlanningTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';
import { ResourcePlanningSorting } from './ResourcePlanningSorting';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  };
}

interface EditFormData {
  profileId: string;
  billTypeId: string | null;
  projectId: string | null;
  engagementPercentage: number;
  billingPercentage: number;
  releaseDate: string;
  engagementStartDate: string;
}

interface ResourcePlanningTableViewProps {
  data: ResourcePlanningData[];
  pagination?: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
  isLoading: boolean;
  onEdit: (item: ResourcePlanningData) => void;
  // Inline edit props
  editingItemId: string | null;
  editData: EditFormData | null;
  onStartEdit: (item: ResourcePlanningData) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  editLoading: boolean;
  // Pagination props
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export const ResourcePlanningTableView: React.FC<ResourcePlanningTableViewProps> = ({
  data,
  pagination,
  isLoading,
  onEdit,
  editingItemId,
  editData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  editLoading,
  currentPage,
  setCurrentPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-muted-foreground">Loading resource planning data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ResourcePlanningSorting
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        {/* Show current page info */}
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.filtered_count)} of {pagination.filtered_count} entries
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Bill Type</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Engagement %</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No planned resources found. Try adjusting your filters or create a new assignment.
                </td>
              </TableRow>
            ) : (
              data.map((item) => (
                <ResourcePlanningTableRow
                  key={item.id}
                  item={item}
                  isEditing={editingItemId === item.id}
                  editData={editData}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  onEditDataChange={onEditDataChange}
                  editLoading={editLoading}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add pagination */}
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
