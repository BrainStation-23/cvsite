
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle2, Clock, Award, BarChart3 } from 'lucide-react';
import { useProfileCompletionStatistics } from '@/hooks/use-profile-completion-statistics';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalProfiles = completionStats?.total_profiles || 0;
  const avgCompletion = completionStats?.avg_completion_rate || 0;
  const highAchievers = completionStats?.profiles_above_75_percent || 0;
  const steadyProgress = completionStats?.profiles_above_50_percent || 0;
  const gettingStarted = totalProfiles - steadyProgress;

  const highAchieverPercent = totalProfiles > 0 ? Math.round((highAchievers / totalProfiles) * 100) : 0;
  const steadyProgressPercent = totalProfiles > 0 ? Math.round(((steadyProgress - highAchievers) / totalProfiles) * 100) : 0;
  const gettingStartedPercent = totalProfiles > 0 ? Math.round((gettingStarted / totalProfiles) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Profile Development Overview
        </h2>
        <p className="text-muted-foreground">
          Track the progress and completion rates across all employee profiles
        </p>
      </div>

      {/* Hero Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Profiles */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profiles Created</p>
                <p className="text-3xl font-bold">{totalProfiles}</p>
                <p className="text-xs text-muted-foreground mt-1">Active employees</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Completion */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600">{avgCompletion}%</p>
                <Progress value={avgCompletion} className="mt-2" />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Achievers */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Achievers</p>
                <p className="text-3xl font-bold text-green-600">{highAchievers}</p>
                <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                  {highAchieverPercent}% of total
                </Badge>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steady Progress */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Steady Progress</p>
                <p className="text-3xl font-bold text-orange-600">{steadyProgress - highAchievers}</p>
                <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800">
                  {steadyProgressPercent}% of total
                </Badge>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Progress by Resource Type
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Completion rates and profile counts across different resource types
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completionStats?.resource_type_breakdown?.map((item) => (
              <div key={item.resource_type_id || 'unspecified'} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.resource_type_name}</h4>
                  <Badge variant="outline">{item.total_profiles} profiles</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">{item.avg_completion_rate}%</span>
                  </div>
                  <Progress value={item.avg_completion_rate} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-700">
                      {Math.round((item.avg_completion_rate / 100) * item.total_profiles)}
                    </div>
                    <div className="text-green-600">Well developed</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="font-medium text-orange-700">
                      {item.total_profiles - Math.round((item.avg_completion_rate / 100) * item.total_profiles)}
                    </div>
                    <div className="text-orange-600">In progress</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">High Achievers</h3>
            <p className="text-3xl font-bold text-green-700 mb-1">{highAchievers}</p>
            <p className="text-sm text-green-600">75%+ Profile Completion</p>
            <div className="mt-3">
              <Progress value={highAchieverPercent} className="h-2 bg-green-200" />
              <p className="text-xs text-green-600 mt-1">{highAchieverPercent}% of workforce</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-orange-800 mb-2">Steady Progress</h3>
            <p className="text-3xl font-bold text-orange-700 mb-1">{steadyProgress - highAchievers}</p>
            <p className="text-sm text-orange-600">50-75% Profile Completion</p>
            <div className="mt-3">
              <Progress value={steadyProgressPercent} className="h-2 bg-orange-200" />
              <p className="text-xs text-orange-600 mt-1">{steadyProgressPercent}% of workforce</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">Getting Started</h3>
            <p className="text-3xl font-bold text-blue-700 mb-1">{gettingStarted}</p>
            <p className="text-sm text-blue-600">Under 50% Completion</p>
            <div className="mt-3">
              <Progress value={gettingStartedPercent} className="h-2 bg-blue-200" />
              <p className="text-xs text-blue-600 mt-1">{gettingStartedPercent}% of workforce</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
