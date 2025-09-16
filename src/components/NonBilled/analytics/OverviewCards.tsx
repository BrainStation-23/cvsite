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
    long_term_non_billed_resources_count: number;
    critical_non_billed_resources_count: number;
    avg_experience_years: number;
    // Bench specific fields
    total_bench_count: number;
    avg_bench_duration_days: number;
    bench_initial_count: number;
    bench_critical_count: number;
    non_bench_initial_count: number;
    non_bench_critical_count: number;
  };
  recent_trends: {
    new_non_billed_resources_last_7_days: number;
    new_non_billed_resources_last_30_days: number;
  };
}

interface OverviewCardsProps {
  data: OverviewData;
  isLoading: boolean;
}

export function OverviewCards({ data, isLoading }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Non Billed',
      value: data.overview.total_non_billed_resources_count,
      icon: Users,
      description: 'Current non-billed resources',
      variant: 'default' as const,
    },
    {
      title: 'Total Bench',
      value: data.overview.total_bench_count,
      icon: Building2,
      description: 'Resources on bench',
      variant: data.overview.total_bench_count > 0 ? 'secondary' as const : 'default' as const,
    },
    {
      title: 'Avg Duration',
      value: `${data.overview.avg_non_billed_resources_duration_days} days`,
      icon: Clock,
      description: 'Average non-billed duration',
      variant: 'default' as const,
    },
    {
      title: 'Avg Bench Duration',
      value: `${data.overview.avg_bench_duration_days} days`,
      icon: Timer,
      description: 'Average bench duration',
      variant: 'default' as const,
    },
    {
      title: 'Long Term (>30d)',
      value: data.overview.long_term_non_billed_resources_count,
      icon: Calendar,
      description: 'Resources >30 days',
      variant: data.overview.long_term_non_billed_resources_count > 0 ? 'destructive' as const : 'default' as const,
    },
    {
      title: 'Critical Risk (>60d)',
      value: data.overview.critical_non_billed_resources_count,
      icon: AlertTriangle,
      description: 'Resources >60 days',
      variant: data.overview.critical_non_billed_resources_count > 0 ? 'destructive' as const : 'default' as const,
    },
    {
      title: 'New (7 days)',
      value: data.recent_trends.new_non_billed_resources_last_7_days,
      icon: TrendingUp,
      description: 'Recently non-billed',
      variant: 'secondary' as const,
    },
    {
      title: 'Avg Experience',
      value: `${data.overview.avg_experience_years}y`,
      icon: Target,
      description: 'Years of experience',
      variant: 'default' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 animate-fade-in">
      {cards.map((card) => (
        <Card key={card.title} className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              {card.variant !== 'default' && (
                <Badge variant={card.variant} className="text-xs">
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