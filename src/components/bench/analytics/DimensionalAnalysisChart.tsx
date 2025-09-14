import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/statistics/ViewToggle';
import { useState } from 'react';

interface DimensionalData {
  dimension_id: string;
  dimension_name: string;
  total_count: number;
  avg_duration_days: number;
  long_term_count: number;
  avg_experience_years?: number;
  color_code?: string;
}

interface DimensionalAnalysisChartProps {
  data: DimensionalData[];
  isLoading: boolean;
  dimension: 'sbu' | 'expertise' | 'bill_type';
  title?: string;
}

export function DimensionalAnalysisChart({ 
  data, 
  isLoading, 
  dimension,
  title
}: DimensionalAnalysisChartProps) {
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(false);
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const dimensionLabels = {
    sbu: 'SBU',
    expertise: 'Expertise',
    bill_type: 'Bill Type'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Total Count: <span className="font-medium">{data.total_count}</span></p>
            <p>Avg Duration: <span className="font-medium">{data.avg_duration_days} days</span></p>
            <p>Long Term (30+ days): <span className="font-medium">{data.long_term_count}</span></p>
            {data.avg_experience_years && (
              <p>Avg Experience: <span className="font-medium">{data.avg_experience_years}y</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Sort data by total count descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.total_count - a.total_count)
    .slice(0, 10);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {title || `Bench Analysis by ${dimensionLabels[dimension]}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of bench metrics across different {dimensionLabels[dimension].toLowerCase()}s
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="dimension_name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="total_count" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Total Count"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {showTables && (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dimensionLabels[dimension]}</TableHead>
                  <TableHead className="text-right">Total Count</TableHead>
                  <TableHead className="text-right">Avg Duration (days)</TableHead>
                  <TableHead className="text-right">Long Term Count</TableHead>
                  {sortedData.some(d => d.avg_experience_years) && (
                    <TableHead className="text-right">Avg Experience (years)</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item) => (
                  <TableRow key={item.dimension_id}>
                    <TableCell className="font-medium">{item.dimension_name}</TableCell>
                    <TableCell className="text-right">{item.total_count}</TableCell>
                    <TableCell className="text-right">{item.avg_duration_days}</TableCell>
                    <TableCell className="text-right">{item.long_term_count}</TableCell>
                    {sortedData.some(d => d.avg_experience_years) && (
                      <TableCell className="text-right">
                        {item.avg_experience_years ? `${item.avg_experience_years}y` : '-'}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}