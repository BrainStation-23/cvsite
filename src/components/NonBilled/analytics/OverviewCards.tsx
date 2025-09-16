import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Target
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
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
      title: 'Total Non Billed Resources',
      value: data.overview.total_non_billed_resources_count,
      icon: Users,
      description: 'Current non billed resources count',
      variant: 'default' as const,
    },
    {
      title: 'Avg Duration',
      value: `${data.overview.avg_non_billed_resources_duration_days} days`,
      icon: Clock,
      description: 'Average non billed resources duration',
      variant: 'default' as const,
    },
    {
      title: 'Long Term',
      value: data.overview.long_term_non_billed_resources_count,
      icon: Calendar,
      description: '>30 days on non billed resources',
      variant: data.overview.long_term_non_billed_resources_count > 0 ? 'destructive' as const : 'default' as const,
    },
    {
      title: 'Critical Risk',
      value: data.overview.critical_non_billed_resources_count,
      icon: AlertTriangle,
      description: '>90 days on non billed resources',
      variant: data.overview.critical_non_billed_resources_count > 0 ? 'destructive' as const : 'default' as const,
    },
    {
      title: 'New (7 days)',
      value: data.recent_trends.new_non_billed_resources_last_7_days,
      icon: TrendingUp,
      description: 'Recently non billed resources',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-fade-in">
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