
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PIP } from '@/types/pip';
import { PIPActions } from './PIPActions';

interface PIPListTableProps {
  pips: PIP[];
  pagination?: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEditPIP: (pip: PIP) => void;
  onDeletePIP: (pip: PIP) => void;
  onViewPIP: (pip: PIP) => void;
  isDeleting?: boolean;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const PIPListTable: React.FC<PIPListTableProps> = ({
  pips,
  pagination,
  isLoading,
  onPageChange,
  onEditPIP,
  onDeletePIP,
  onViewPIP,
  isDeleting = false
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cvsite-teal"></div>
          <p className="mt-2 text-muted-foreground">Loading PIPs...</p>
        </div>
      </div>
    );
  }

  if (!pips.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No Performance Improvement Plans found.</p>
        </div>
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
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pips.map((pip) => (
              <TableRow key={pip.pip_id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={pip.profile_image || ''} alt={pip.employee_name} />
                      <AvatarFallback>
                        {pip.employee_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{pip.employee_name}</div>
                      <div className="text-sm text-muted-foreground">{pip.employee_id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{pip.designation || '-'}</TableCell>
                <TableCell>{pip.sbu_name || '-'}</TableCell>
                <TableCell>{pip.manager_name || '-'}</TableCell>
                <TableCell>{new Date(pip.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(pip.end_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(pip.status)}>
                    {pip.status.charAt(0).toUpperCase() + pip.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PIPActions
                    pip={pip}
                    onEdit={onEditPIP}
                    onDelete={onDeletePIP}
                    onView={onViewPIP}
                    isDeleting={isDeleting}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.page_count > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.page * pagination.per_page, pagination.filtered_count)} of{' '}
            {pagination.filtered_count} PIPs
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm">
              Page {pagination.page} of {pagination.page_count}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.page_count}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
