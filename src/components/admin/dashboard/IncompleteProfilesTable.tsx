
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useIncompleteCvProfiles } from '@/hooks/use-incomplete-cv-profiles';
import { useProfileCountsByResourceType } from '@/hooks/use-profile-counts-by-resource-type';
import { Skeleton } from '@/components/ui/skeleton';

export const IncompleteProfilesTable: React.FC = () => {
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const { data: resourceTypes } = useProfileCountsByResourceType();
  const { data: incompleteProfiles, isLoading, error } = useIncompleteCvProfiles(
    resourceTypeFilter || undefined
  );

  const handleFilterChange = (value: string) => {
    setResourceTypeFilter(value === 'all' ? '' : value);
  };

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
          </CardTitle>
          <Select value={resourceTypeFilter || 'all'} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by resource type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resource Types</SelectItem>
              {resourceTypes?.map((type) => (
                <SelectItem key={type.resource_type} value={type.resource_type}>
                  {type.resource_type || 'Unspecified'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        ) : !incompleteProfiles?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p className="text-lg font-medium">All profiles are complete!</p>
            <p className="text-sm">No incomplete CV profiles found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incompleteProfiles.map((profile) => (
              <div key={profile.profile_id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {profile.employee_id} • {profile.resource_type || 'Unspecified'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.round(profile.completion_percentage)}% Complete
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {profile.missing_count} missing sections
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={profile.completion_percentage} 
                  className="mb-3"
                />
                
                <div className="flex flex-wrap gap-2">
                  {profile.missing_sections.map((section) => (
                    <Badge key={section} variant="destructive" className="text-xs">
                      {section.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
