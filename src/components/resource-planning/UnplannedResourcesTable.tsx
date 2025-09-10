
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, User, Calendar, Briefcase, Building2 } from 'lucide-react';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';
import { Badge } from '@/components/ui/badge';

interface UnplannedResource {
  id: string;
  profile_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  current_designation: string;
  profile_image?: string;
  biography?: string;
  date_of_joining?: string;
  career_start_date?: string;
  total_engagement_percentage: number;
  available_capacity: number;
  sbu?: {
    id: string;
    name: string;
    sbu_head_email?: string;
  };
  manager?: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  expertise_type?: {
    id: string;
    name: string;
  };
  resource_type?: {
    id: string;
    name: string;
  };
  active_assignments: Array<{
    id: string;
    engagement_percentage: number;
    billing_percentage: number;
    engagement_start_date: string;
    release_date?: string;
    engagement_complete: boolean;
    weekly_validation: boolean;
    project?: {
      id: string;
      project_name: string;
      client_name: string;
      project_manager: string;
      budget: number;
    };
    bill_type?: {
      id: string;
      name: string;
    };
  }>;
  created_at: string;
  updated_at: string;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAvailabilityColor = (capacity: number) => {
    if (capacity >= 75) return 'bg-green-500';
    if (capacity >= 50) return 'bg-yellow-500';
    if (capacity >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Expertise</TableHead>
              <TableHead>Bill Type</TableHead>
              <TableHead>Current Engagement</TableHead>
              <TableHead>Available Capacity</TableHead>
              <TableHead>Active Assignments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No unplanned resources found.
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {resource.profile_image ? (
                          <img
                            src={resource.profile_image}
                            alt={`${resource.first_name} ${resource.last_name}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {resource.first_name} {resource.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {resource.employee_id}
                        </div>
                        {resource.current_designation && (
                          <div className="text-xs text-muted-foreground">
                            {resource.current_designation}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {resource.sbu ? (
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{resource.sbu.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {resource.manager ? (
                      <div>
                        <div className="text-sm font-medium">
                          {resource.manager.first_name} {resource.manager.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {resource.manager.employee_id}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {resource.expertise_type && (
                        <Badge variant="secondary" className="text-xs">
                          {resource.expertise_type.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {resource.resource_type && (
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${resource.total_engagement_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {resource.total_engagement_percentage}%
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getAvailabilityColor(resource.available_capacity)}`}
                      />
                      <span className="text-sm font-medium">
                        {resource.available_capacity}%
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 max-w-xs">
                      {resource.active_assignments.length === 0 ? (
                        <span className="text-muted-foreground text-sm">No active assignments</span>
                      ) : (
                        resource.active_assignments.map((assignment) => (
                          <div key={assignment.id} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium">
                              {assignment.project?.project_name || 'No Project'}
                            </div>
                            <div className="text-muted-foreground">
                              {assignment.engagement_percentage}% engagement
                            </div>
                            {assignment.release_date && (
                              <div className="text-muted-foreground flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Until: {formatDate(assignment.release_date)}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>

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
          perPage={10}
          setPerPage={() => {}}
        />
      )}
    </div>
  );
};
