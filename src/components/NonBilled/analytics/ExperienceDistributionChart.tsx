import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/statistics/ViewToggle';
import { useState } from 'react';


interface ExperienceDistributionChartProps {
  data: {
    junior: number;
    mid: number;
    senior: number;
    unknown: number;
    total_count: number;
  };
  isLoading: boolean;
  title?: string;
}

const EXPERIENCE_COLORS = {
  junior: 'hsl(var(--chart-2))', // Green for junior
  mid: 'hsl(var(--chart-1))', // Blue for mid
  senior: 'hsl(var(--chart-3))', // Purple for senior
  unknown: 'hsl(var(--chart-4))', // Pink for unknown
};

export function ExperienceDistributionChart({ data, isLoading, title }: ExperienceDistributionChartProps) {
  const [showCharts, setShowCharts] = useState(false);
  const [showTables, setShowTables] = useState(true);

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

  // Transform data for chart and table
  const total = data.total_count || (data.junior + data.mid + data.senior + data.unknown);

  const chartData = [
    { name: 'Junior', value: data.junior, color: EXPERIENCE_COLORS.junior },
    { name: 'Mid', value: data.mid, color: EXPERIENCE_COLORS.mid },
    { name: 'Senior', value: data.senior, color: EXPERIENCE_COLORS.senior },
    { name: 'Unknown', value: data.unknown, color: EXPERIENCE_COLORS.unknown },
  ].filter(item => item.value > 0);

  const tableData = [
    { level: 'Junior', count: data.junior, percentage: total ? Math.round((data.junior / total) * 100) : 0, color: EXPERIENCE_COLORS.junior },
    { level: 'Mid', count: data.mid, percentage: total ? Math.round((data.mid / total) * 100) : 0, color: EXPERIENCE_COLORS.mid },
    { level: 'Senior', count: data.senior, percentage: total ? Math.round((data.senior / total) * 100) : 0, color: EXPERIENCE_COLORS.senior },
    { level: 'Unknown', count: data.unknown, percentage: total ? Math.round((data.unknown / total) * 100) : 0, color: EXPERIENCE_COLORS.unknown },
  ].filter(item => item.count > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Count: <span className="font-medium">{data.value}</span></p>
          <p className="text-sm">
            Percentage: <span className="font-medium">{total ? Math.round((data.value / total) * 100) : 0}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {title || 'Experience Distribution'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of resources by experience level
            </p>
          </div>
          <ViewToggle
            showCharts={showCharts}
            showTables={showTables}
            onToggleCharts={() => {
              setShowCharts(!showCharts);
              if (!showCharts && showTables) setShowTables(false);
            }}
            onToggleTables={() => {
              setShowTables(!showTables);
              if (!showTables && showCharts) setShowCharts(false);
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {showCharts && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {showTables && (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experience Level</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item) => (
                  <TableRow key={item.level}>
                    <TableCell className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      {item.level}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">{item.percentage}%</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{total}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}