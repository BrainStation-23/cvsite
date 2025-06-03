
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ExperienceChartProps {
  data: Array<{ range: string; count: number }>;
  isLoading?: boolean;
}

const COLORS = [
  'hsl(var(--cvsite-teal))',
  'hsl(var(--cvsite-navy))',
  'hsl(210, 40%, 70%)',
  'hsl(210, 40%, 50%)',
  'hsl(210, 40%, 30%)'
];

const chartConfig = {
  count: {
    label: "Employees",
  },
};

export const ExperienceChart: React.FC<ExperienceChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Experience Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredData = data.filter(item => item.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="count"
              nameKey="range"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
