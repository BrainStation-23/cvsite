
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfileCountsByResourceType } from '@/hooks/use-profile-counts-by-resource-type';
import { useProfileCompletionByResourceType } from '@/hooks/use-profile-completion-by-resource-type';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ProfileStatisticsOverview: React.FC = () => {
  const { data: profileCounts, isLoading: countsLoading, error: countsError } = useProfileCountsByResourceType();
  const { data: completionData, isLoading: completionLoading, error: completionError } = useProfileCompletionByResourceType();

  if (countsError || completionError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading profile statistics: {countsError?.message || completionError?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (countsLoading || completionLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalProfiles = profileCounts?.reduce((sum, item) => sum + item.profile_count, 0) || 0;
  const totalCompleted = completionData?.reduce((sum, item) => sum + item.completed_profiles, 0) || 0;
  const totalIncomplete = completionData?.reduce((sum, item) => sum + item.incomplete_profiles, 0) || 0;
  const overallCompletionRate = totalProfiles > 0 ? Math.round((totalCompleted / totalProfiles) * 100) : 0;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profile Statistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Total Profiles with Breakdown */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Total Profiles
                  </div>
                  <div className="text-2xl font-bold">{totalProfiles}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Breakdown by Resource Type:</div>
                  {profileCounts?.map((item) => (
                    <div key={item.resource_type_id || 'unspecified'} className="flex justify-between text-sm">
                      <span>{item.resource_type_name || 'Unspecified'}</span>
                      <span className="font-medium">{item.profile_count}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Completed Profiles with Breakdown */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Completed CVs
                  </div>
                  <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">{overallCompletionRate}% complete</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Completed by Resource Type:</div>
                  {completionData?.map((item) => (
                    <div key={item.resource_type_id || 'unspecified'} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.resource_type_name || 'Unspecified'}</span>
                        <span className="font-medium">{item.completed_profiles}/{item.total_profiles}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(item.completion_rate)}% completion rate
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Incomplete Profiles with Breakdown */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Incomplete CVs
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{totalIncomplete}</div>
                  <div className="text-sm text-muted-foreground">{100 - overallCompletionRate}% incomplete</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Incomplete by Resource Type:</div>
                  {completionData?.map((item) => (
                    <div key={item.resource_type_id || 'unspecified'} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.resource_type_name || 'Unspecified'}</span>
                        <span className="font-medium">{item.incomplete_profiles}/{item.total_profiles}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(100 - item.completion_rate)}% incomplete
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
