import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, Clock } from 'lucide-react';

interface TrendData {
  period: string;
  new_non_billed_resources_count: number;
  affected_sbus: number;
  avg_experience_of_new_non_billed_resources: number;
}

interface TrendsChartProps {
  data: {
    trends: TrendData[];
    placement_metrics: {
      avg_days_to_placement: number;
    };
  };
  isLoading: boolean;
  periodType: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export function TrendsChart({ data, isLoading, periodType, onPeriodChange }: Readonly<TrendsChartProps>) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatXAxisLabel = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      switch (periodType) {
        case 'daily':
          return format(date, 'MMM dd');
        case 'weekly':
          return format(date, 'MMM dd');
        case 'monthly':
          return format(date, 'MMM yyyy');
        default:
          return format(date, 'MMM dd');
      }
    } catch {
      return dateString;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{formatXAxisLabel(label)}</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
              New Non Billed Resources: <span className="font-medium">{data.new_non_billed_resources_count}</span>
            </p>
            <p>Affected SBUs: <span className="font-medium">{data.affected_sbus}</span></p>
            <p>Avg Experience: <span className="font-medium">{data.avg_experience_of_new_non_billed_resources}y</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Sort trends by period to ensure chronological order
  const sortedTrends = [...data.trends].sort((a, b) => 
    new Date(a.period).getTime() - new Date(b.period).getTime()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Non Billed Resources Trends
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                New Non Billed Resources additions over time
              </p>
            </div>
            <Select value={periodType} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sortedTrends}>
              <defs>
                <linearGradient id="non_billed_resourcesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period"
                tickFormatter={formatXAxisLabel}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="new_non_billed_resources_count"
                stroke="hsl(var(--chart-1))"
                fill="url(#non_billed_resourcesTrendGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Placement Velocity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Placement Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.placement_metrics.avg_days_to_placement 
                ? Math.round(data.placement_metrics.avg_days_to_placement)
                : 'N/A'
              }
            </div>
            <p className="text-sm text-muted-foreground">days to placement</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Time from non_billed_resources to project assignment
            </div>
          </CardContent>
        </Card>

        {/* Trend Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedTrends.length > 0 && (
              <>
                <div className="text-sm">
                  <p className="font-medium">Latest Period</p>
                  <p className="text-muted-foreground">
                    {sortedTrends[sortedTrends.length - 1]?.new_non_billed_resources_count || 0} new non_billed_resources additions
                  </p>
                </div>
                
                <div className="text-sm">
                  <p className="font-medium">SBU Impact</p>
                  <p className="text-muted-foreground">
                    {sortedTrends[sortedTrends.length - 1]?.affected_sbus || 0} SBUs affected
                  </p>
                </div>

                <div className="text-sm">
                  <p className="font-medium">Experience Level</p>
                  <p className="text-muted-foreground">
                    {sortedTrends[sortedTrends.length - 1]?.avg_experience_of_new_non_billed_resources || 0}y avg experience
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}