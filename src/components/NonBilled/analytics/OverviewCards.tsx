import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Target,
  Building2,
  Timer
} from 'lucide-react';

interface OverviewData {
  overview: {
    total_non_billed_resources_count: number;
    avg_non_billed_resources_duration_days: number;
    max_non_billed_resources_duration_days: number;
    min_non_billed_resources_duration_days: number;
    avg_experience_years: number;
    // New fields for initial and critical counts (all non-billed)
    non_billed_initial_count: number;
    non_billed_critical_count: number;
    // Bench specific fields
    total_bench_count: number;
    avg_bench_duration_days: number;
    bench_initial_count: number;
    bench_critical_count: number;
  };
  recent_trends: {
    new_non_billed_resources_last_7_days: number;
    new_non_billed_resources_last_30_days: number;
  };
}

interface OverviewCardsProps {
  data: OverviewData;
  isLoading: boolean;
  benchFilter: boolean | null;
}

export function OverviewCards({ data, isLoading, benchFilter }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Helper function to get filter display name
  const getFilterDisplayName = () => {
    if (benchFilter === true) return 'Bench';
    if (benchFilter === false) return 'Non-Bench';
    return 'All';
  };

  // Helper function to get appropriate counts based on filter
  const getFilteredCounts = () => {
    if (benchFilter === true) {
      return {
        total: data.overview.total_bench_count,
        avgDuration: data.overview.avg_bench_duration_days,
        initial: data.overview.bench_initial_count,
        critical: data.overview.bench_critical_count,
        filterType: 'bench'
      };
    } else if (benchFilter === false) {
      // Non-bench resources (calculated as total - bench)
      const nonBenchTotal = data.overview.total_non_billed_resources_count - data.overview.total_bench_count;
      const nonBenchInitial = data.overview.non_billed_initial_count - data.overview.bench_initial_count;
      const nonBenchCritical = data.overview.non_billed_critical_count - data.overview.bench_critical_count;
      const nonBenchAvgDuration = nonBenchTotal > 0 ? data.overview.avg_non_billed_resources_duration_days : 0;
      
      return {
        total: nonBenchTotal,
        avgDuration: nonBenchAvgDuration,
        initial: nonBenchInitial,
        critical: nonBenchCritical,
        filterType: 'non-bench'
      };
    } else {
      // All resources
      return {
        total: data.overview.total_non_billed_resources_count,
        avgDuration: data.overview.avg_non_billed_resources_duration_days,
        initial: data.overview.non_billed_initial_count,
        critical: data.overview.non_billed_critical_count,
        filterType: 'all'
      };
    }
  };

  const filteredData = getFilteredCounts();
  const filterName = getFilterDisplayName();

  // Show empty state for non-bench filter if no non-bench resources exist
  if (benchFilter === false && filteredData.total <= 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Non-Bench Resources Found</h3>
              <p className="text-sm text-muted-foreground">
                All current non-billed resources appear to be on the bench. Try selecting "All Resources" or "Bench Only" to view data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: `Total ${filterName}`,
      value: filteredData.total,
      icon: Users,
      description: `Current ${filterName.toLowerCase()} resources`,
      variant: 'default' as const,
    },
    {
      title: 'Avg Duration',
      value: `${Math.round(filteredData.avgDuration)} days`,
      icon: Timer,
      description: `Average ${filterName.toLowerCase()} duration`,
      variant: 'default' as const,
    },
    {
      title: 'Initial (<30d)',
      value: filteredData.initial,
      icon: Calendar,
      description: `${filterName} resources <30 days`,
      variant: 'default' as const,
    },
    {
      title: 'Critical Risk (>60d)',
      value: filteredData.critical,
      icon: AlertTriangle,
      description: `${filterName} resources >60 days`,
      variant: filteredData.critical > 0 ? 'destructive' as const : 'default' as const,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {cards.map((card) => (
        <Card key={card.title} className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-2">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground mb-2">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {card.description}
              </p>
              {card.variant !== 'default' && (
                <Badge variant={card.variant} className="text-xs w-fit">
                  {card.variant === 'destructive' ? 'Alert' : 'Recent'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}