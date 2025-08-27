
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PIP } from '@/types/pip';
import { PIPActions } from './PIPActions';

interface PaginationInfo {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface PIPListTableProps {
  pips: PIP[];
  pagination?: PaginationInfo;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEditPIP: (pip: PIP) => void;
  onDeletePIP: (pip: PIP) => void;
  onViewPIP: (pip: PIP) => void;
  isDeleting: boolean;
  showActions?: boolean;
}

export const PIPListTable: React.FC<PIPListTableProps> = ({
  pips,
  pagination,
  isLoading,
  onPageChange,
  onEditPIP,
  onDeletePIP,
  onViewPIP,
  isDeleting,
  showActions = true
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pips.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No PIPs found matching your criteria.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hr_initiation':
        return 'bg-yellow-100 text-yellow-800';
      case 'pm_feedback':
        return 'bg-blue-100 text-blue-800';
      case 'hr_review':
        return 'bg-purple-100 text-purple-800';
      case 'ld_goal_setting':
        return 'bg-orange-100 text-orange-800';
      case 'mid_review':
        return 'bg-indigo-100 text-indigo-800';
      case 'final_review':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Performance Improvement Plans
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.filtered_count} of {pagination.total_count} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pips.map((pip) => (
              <div key={pip.pip_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={pip.profile_image || ''} 
                        alt={pip.employee_name}
                      />
                      <AvatarFallback>
                        {pip.employee_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pip.employee_name}</h3>
                        <Badge variant="outline">{pip.employee_id}</Badge>
                      </div>
                      
                      {pip.designation && (
                        <p className="text-sm text-muted-foreground">{pip.designation}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {pip.sbu_name && <span>SBU: {pip.sbu_name}</span>}
                        {pip.expertise_name && <span>Expertise: {pip.expertise_name}</span>}
                        {pip.manager_name && <span>Manager: {pip.manager_name}</span>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(pip.status)}>
                          {formatStatus(pip.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(pip.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {showActions && (
                    <PIPActions
                      pip={pip}
                      onEdit={onEditPIP}
                      onDelete={onDeletePIP}
                      onView={onViewPIP}
                      isDeleting={isDeleting}
                    />
                  )}
                  
                  {!showActions && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewPIP(pip)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onEditPIP(pip)}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.page_count > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.page_count}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
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
