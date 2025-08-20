
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useProfileCompletionStatistics } from '@/hooks/use-profile-completion-statistics';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ProfileStatisticsOverview: React.FC = () => {
  const { data: completionStats, isLoading, error } = useProfileCompletionStatistics();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading profile statistics: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Profiles with Resource Type Breakdown */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Total Profiles
                  </div>
                  <div className="text-2xl font-bold">{completionStats?.total_profiles || 0}</div>
                  <div className="text-sm text-muted-foreground">All employees</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Breakdown by Resource Type:</div>
                  {completionStats?.resource_type_breakdown?.map((item) => (
                    <div key={item.resource_type_id || 'unspecified'} className="flex justify-between text-sm">
                      <span>{item.resource_type_name}</span>
                      <span className="font-medium">{item.total_profiles}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Average CV Completion Rate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Avg CV Completion
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {completionStats?.avg_completion_rate || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall average</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Average Completion by Resource Type:</div>
                  {completionStats?.resource_type_breakdown?.map((item) => (
                    <div key={item.resource_type_id || 'unspecified'} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.resource_type_name}</span>
                        <span className="font-medium">{item.avg_completion_rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* CVs Above 50% Complete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Target className="h-4 w-4 text-orange-600" />
                    CVs &gt; 50% Complete
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {completionStats?.profiles_above_50_percent || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {completionStats?.total_profiles ? 
                      Math.round((completionStats.profiles_above_50_percent / completionStats.total_profiles) * 100) 
                      : 0}% of total
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-48">
                <div className="text-sm">
                  Profiles with more than half of their CV sections completed (4+ out of 8 sections)
                </div>
              </TooltipContent>
            </Tooltip>

            {/* CVs Above 75% Complete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    CVs &gt; 75% Complete
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {completionStats?.profiles_above_75_percent || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {completionStats?.total_profiles ? 
                      Math.round((completionStats.profiles_above_75_percent / completionStats.total_profiles) * 100) 
                      : 0}% of total
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-48">
                <div className="text-sm">
                  Profiles with most of their CV sections completed (6+ out of 8 sections)
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
