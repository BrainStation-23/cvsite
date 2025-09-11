import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react';

interface BenchRecord {
  planned_status: 'planned' | 'unplanned';
  bench_duration_days: number;
  total_years_experience: number;
}

interface BenchMetricsCardsProps {
  benchRecords: BenchRecord[];
  isLoading: boolean;
}

export const BenchMetricsCards: React.FC<BenchMetricsCardsProps> = ({
  benchRecords,
  isLoading,
}) => {
  const totalResources = benchRecords.length;
  const plannedResources = benchRecords.filter(record => record.planned_status === 'planned').length;
  const unplannedResources = benchRecords.filter(record => record.planned_status === 'unplanned').length;
  
  const averageBenchDuration = benchRecords.length > 0
    ? Math.round(benchRecords.reduce((sum, record) => sum + record.bench_duration_days, 0) / benchRecords.length)
    : 0;

  const averageExperience = benchRecords.length > 0
    ? Math.round((benchRecords.reduce((sum, record) => sum + record.total_years_experience, 0) / benchRecords.length) * 10) / 10
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-muted animate-pulse rounded mb-1"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total on Bench</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResources}</div>
          <p className="text-xs text-muted-foreground">
            Resources currently on bench
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Planning Status</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Planned: {plannedResources}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Unplanned: {unplannedResources}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Bench Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageBenchDuration}</div>
          <p className="text-xs text-muted-foreground">
            Days on bench (average)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageExperience}</div>
          <p className="text-xs text-muted-foreground">
            Years of experience (average)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};