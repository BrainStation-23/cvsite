import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExperienceDistribution {
  junior: number;
  mid: number;
  senior: number;
  unknown: number;
}

interface ExperienceDistributionChartProps {
  data: ExperienceDistribution;
  isLoading: boolean;
}

const EXPERIENCE_COLORS = {
  junior: 'hsl(var(--chart-2))', // Green for junior
  mid: 'hsl(var(--chart-1))', // Blue for mid
  senior: 'hsl(var(--chart-3))', // Purple for senior
  unknown: 'hsl(var(--chart-4))', // Pink for unknown
};

export function ExperienceDistributionChart({ data, isLoading }: ExperienceDistributionChartProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Junior (0-3y)', value: data.junior, label: '0-3 years' },
    { name: 'Mid (3-8y)', value: data.mid, label: '3-8 years' },
    { name: 'Senior (8y+)', value: data.senior, label: '8+ years' },
    { name: 'Unknown', value: data.unknown, label: 'Unknown' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="font-medium text-foreground">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Experience Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Breakdown of bench resources by experience level
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={EXPERIENCE_COLORS[entry.name.toLowerCase().includes('junior') ? 'junior' : 
                       entry.name.toLowerCase().includes('mid') ? 'mid' : 
                       entry.name.toLowerCase().includes('senior') ? 'senior' : 'unknown']}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}