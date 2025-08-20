
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIncompleteCvProfiles } from '@/hooks/use-incomplete-cv-profiles';
import { useProfileCountsByResourceType } from '@/hooks/use-profile-counts-by-resource-type';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';

// Memoized profile card component to prevent unnecessary re-renders
const ProfileCard = React.memo(({ 
  profile, 
  onEdit 
}: { 
  profile: any; 
  onEdit: (id: string) => void;
}) => {
  const completionPercentage = profile.total_sections > 0 
    ? Math.round((profile.completion_score / profile.total_sections) * 100)
    : 0;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-medium">
            {profile.first_name} {profile.last_name}
          </h4>
          <p className="text-sm text-muted-foreground">
            ID: {profile.employee_id} • {profile.resource_type_name || 'Unspecified'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">
              {completionPercentage}% Complete
            </div>
            <div className="text-xs text-muted-foreground">
              {profile.missing_count} missing sections
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(profile.profile_id)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      <Progress 
        value={completionPercentage} 
        className="mb-3"
      />
      
      <div className="flex flex-wrap gap-2">
        {profile.missing_sections.map((section: string) => (
          <Badge key={section} variant="destructive" className="text-xs">
            {section.replace('_', ' ').toUpperCase()}
          </Badge>
        ))}
      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';

export const IncompleteProfilesTableOptimized: React.FC = () => {
  const navigate = useNavigate();
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: resourceTypes } = useProfileCountsByResourceType();
  const { 
    data: profilesData, 
    isLoading, 
    error,
    isFetching 
  } = useIncompleteCvProfiles({
    resourceTypeFilter: resourceTypeFilter || undefined,
    searchTerm: debouncedSearchTerm || undefined,
    page: currentPage,
    pageSize,
  });

  const handleFilterChange = useCallback((value: string) => {
    setResourceTypeFilter(value === 'all' ? '' : value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleEditProfile = useCallback((profileId: string) => {
    navigate(`/employee/profile/${profileId}`);
  }, [navigate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Memoize pagination info to prevent unnecessary recalculations
  const paginationInfo = useMemo(() => {
    if (!profilesData) return null;
    
    return {
      totalCount: profilesData.total_count,
      totalPages: profilesData.total_pages,
      hasNextPage: currentPage < profilesData.total_pages,
      hasPreviousPage: currentPage > 1,
      startItem: (currentPage - 1) * pageSize + 1,
      endItem: Math.min(currentPage * pageSize, profilesData.total_count),
    };
  }, [profilesData, currentPage, pageSize]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading incomplete profiles: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Incomplete CV Profiles
            {paginationInfo && (
              <span className="text-sm font-normal text-muted-foreground">
                ({paginationInfo.totalCount} total)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
            <Select value={resourceTypeFilter || 'all'} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resource Types</SelectItem>
                {resourceTypes?.map((type) => (
                  <SelectItem key={type.resource_type_id || 'unspecified'} value={type.resource_type_id || 'unspecified'}>
                    {type.resource_type_name || 'Unspecified'} ({type.profile_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: pageSize }, (_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !profilesData?.profiles?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p className="text-lg font-medium">
              {searchTerm || resourceTypeFilter ? 'No matching profiles found!' : 'All profiles are complete!'}
            </p>
            <p className="text-sm">
              {searchTerm || resourceTypeFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'No incomplete CV profiles found.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Loading indicator for pagination */}
            {isFetching && (
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  Loading...
                </div>
              </div>
            )}

            {/* Profiles List */}
            <div className="space-y-4">
              {profilesData.profiles.map((profile) => (
                <ProfileCard
                  key={profile.profile_id}
                  profile={profile}
                  onEdit={handleEditProfile}
                />
              ))}
            </div>

            {/* Pagination */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginationInfo.hasPreviousPage || isFetching}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {paginationInfo.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginationInfo.hasNextPage || isFetching}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
