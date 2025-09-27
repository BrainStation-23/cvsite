
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuditData } from '@/hooks/use-audit-data';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  Search, 
  Download, 
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

// Typed shape for audit items consumed in this view
interface ProfileImageAuditItem {
  id: string;
  upload_timestamp: string;
  profile?: {
    employee_id?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  general_information?: {
    first_name?: string;
    last_name?: string;
  } | null;
  uploaded_by?: {
    employee_id?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  uploaded_by_general_info?: {
    first_name?: string;
    last_name?: string;
  } | null;
  validation_errors: string[];
  image_url?: string | null;
  profile_id?: string;
}

const ProfileImageWarningAudit: React.FC = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10
  });

  const { data, totalCount, totalPages, isLoading, exportData, isExporting } = useAuditData(filters);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm, page: 1 }));
  };

  const handleDateFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getDisplayName = (item: ProfileImageAuditItem) => {
    const generalInfo = item.general_information || undefined;
    const profileInfo = item.profile;
    
    const firstName = generalInfo?.first_name || profileInfo?.first_name || '';
    const lastName = generalInfo?.last_name || profileInfo?.last_name || '';
    
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  const getUploaderName = (item: ProfileImageAuditItem) => {
    const generalInfo = item.uploaded_by_general_info || undefined;
    const profileInfo = item.uploaded_by;
    
    const firstName = generalInfo?.first_name || profileInfo?.first_name || '';
    const lastName = generalInfo?.last_name || profileInfo?.last_name || '';
    
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  return (
    <div>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Image Warning Audit
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Review all forced profile image uploads that bypassed validation checks.
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or employee ID..."
                    value={filters.searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) => handleDateFilter(e.target.value, filters.endDate)}
                  className="w-auto"
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) => handleDateFilter(filters.startDate, e.target.value)}
                  className="w-auto"
                />
                <Button 
                  onClick={exportData} 
                  disabled={isExporting}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Violations</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data.filter(item => {
                      const itemDate = new Date(item.upload_timestamp);
                      const now = new Date();
                      return itemDate.getMonth() === now.getMonth() && 
                             itemDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Users</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {new Set(data.map(item => item.profile_id)).size}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Table */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Audit Records</CardTitle>
            <CardDescription>
              Detailed log of all forced profile image uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Validation Errors</TableHead>
                      <TableHead>Image</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(item.upload_timestamp), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(item.upload_timestamp), 'HH:mm:ss')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{getDisplayName(item)}</div>
                            <div className="text-gray-500">
                              ID: {item.profile?.employee_id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{getUploaderName(item)}</div>
                            <div className="text-gray-500">
                              ID: {item.uploaded_by?.employee_id || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.validation_errors.map((error, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {error}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.image_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.image_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-gray-400">No URL</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((filters.page - 1) * filters.pageSize) + 1} to {Math.min(filters.page * filters.pageSize, totalCount)} of {totalCount} results
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileImageWarningAudit;
