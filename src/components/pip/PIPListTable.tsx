
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePIPManagement } from '@/hooks/use-pip-management';
import { PIP } from '@/types/pip';
import { format } from 'date-fns';

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

export const PIPListTable: React.FC = () => {
  const {
    pips,
    pagination,
    isLoading,
    searchParams,
    updateSearchParams
  } = usePIPManagement();

  const handleSearch = (query: string) => {
    updateSearchParams({ searchQuery: query });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder = searchParams.sortBy === sortBy && searchParams.sortOrder === 'asc' ? 'desc' : 'asc';
    updateSearchParams({ sortBy, sortOrder: newSortOrder });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading PIPs...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchParams.searchQuery || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={searchParams.statusFilter || 'all'}
              onValueChange={(value) => updateSearchParams({ statusFilter: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.sortBy || 'created_at'}
              onValueChange={(value) => updateSearchParams({ sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="employee_name">Employee Name</SelectItem>
                <SelectItem value="start_date">Start Date</SelectItem>
                <SelectItem value="end_date">End Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.sortOrder || 'desc'}
              onValueChange={(value: 'asc' | 'desc') => updateSearchParams({ sortOrder: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PIP Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Improvement Plans</CardTitle>
          <CardDescription>
            {pagination ? `Showing ${pagination.filtered_count} results` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No PIPs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pips.map((pip: PIP) => (
                <div
                  key={pip.pip_id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={pip.profile_image || undefined} />
                        <AvatarFallback>
                          {pip.employee_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{pip.employee_name}</h3>
                          <Badge variant="outline">{pip.employee_id}</Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Designation:</strong> {pip.designation || 'N/A'}</p>
                          <p><strong>SBU:</strong> {pip.sbu_name || 'N/A'}</p>
                          <p><strong>Manager:</strong> {pip.manager_name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <Badge variant={getStatusBadgeVariant(pip.status)}>
                        {pip.status.charAt(0).toUpperCase() + pip.status.slice(1)}
                      </Badge>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Start:</strong> {format(new Date(pip.start_date), 'MMM dd, yyyy')}</p>
                        <p><strong>End:</strong> {format(new Date(pip.end_date), 'MMM dd, yyyy')}</p>
                        {pip.mid_date && (
                          <p><strong>Mid Review:</strong> {format(new Date(pip.mid_date), 'MMM dd, yyyy')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.page_count > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.page_count}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.page_count}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
