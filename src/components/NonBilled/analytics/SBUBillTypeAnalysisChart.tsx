import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/statistics/ViewToggle';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SBUBillTypeData {
  sbu_id: string;
  sbu_name: string;
  sbu_color_code?: string;
  bill_type_id: string;
  bill_type_name: string;
  bill_type_color_code?: string;
  total_count: number;
  initial_count: number;
  critical_count: number;
}

interface SBUBillTypeAnalysisChartProps {
  data: SBUBillTypeData[];
  isLoading: boolean;
  title?: string;
}

export function SBUBillTypeAnalysisChart({ 
  data, 
  isLoading, 
  title 
}: SBUBillTypeAnalysisChartProps) {
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(false);
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-64"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {title || 'SBU-Bill Type Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Group data by SBU for visualization
  const sbuGroups = data.reduce((acc, item) => {
    if (!acc[item.sbu_id]) {
      acc[item.sbu_id] = {
        sbu_id: item.sbu_id,
        sbu_name: item.sbu_name,
        sbu_color_code: item.sbu_color_code,
        total_count: 0,
        initial_count: 0,
        critical_count: 0,
        billTypes: []
      };
    }
    acc[item.sbu_id].total_count += item.total_count;
    acc[item.sbu_id].initial_count += item.initial_count;
    acc[item.sbu_id].critical_count += item.critical_count;
    acc[item.sbu_id].billTypes.push(item);
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(sbuGroups);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Total: <span className="font-medium">{data.total_count}</span></p>
            <p>Initial (&lt;30d): <span className="font-medium text-green-600">{data.initial_count}</span></p>
            <p>Critical (&gt;60d): <span className="font-medium text-red-600">{data.critical_count}</span></p>
          </div>
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
              {title || 'SBU-Bill Type Analysis'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Non-billed resources breakdown by SBU and bill type
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showCharts && (
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'stacked' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('stacked')}
                >
                  Stacked
                </Button>
                <Button
                  variant={chartType === 'grouped' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('grouped')}
                >
                  Grouped
                </Button>
              </div>
            )}
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
        </div>
      </CardHeader>
      <CardContent>
        {showCharts && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="sbu_name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              
              {chartType === 'stacked' ? (
                <>
                  <Bar dataKey="initial_count" stackId="a" fill="hsl(var(--chart-2))" name="Initial (<30d)" />
                  <Bar dataKey="critical_count" stackId="a" fill="hsl(var(--destructive))" name="Critical (>60d)" />
                </>
              ) : (
                <>
                  <Bar dataKey="total_count" fill="hsl(var(--chart-1))" name="Total" />
                  <Bar dataKey="initial_count" fill="hsl(var(--chart-2))" name="Initial (<30d)" />
                  <Bar dataKey="critical_count" fill="hsl(var(--destructive))" name="Critical (>60d)" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {showTables && (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SBU</TableHead>
                  <TableHead>Bill Type</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Initial (&lt;30d)</TableHead>
                  <TableHead className="text-right">Critical (&gt;60d)</TableHead>
                  <TableHead className="text-right">Critical %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data
                  .sort((a, b) => b.total_count - a.total_count)
                  .map((item) => {
                    const criticalPercent = item.total_count > 0 
                      ? ((item.critical_count / item.total_count) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <TableRow key={`${item.sbu_id}-${item.bill_type_id}`}>
                        <TableCell className="font-medium">{item.sbu_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.bill_type_color_code && (
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.bill_type_color_code }}
                              />
                            )}
                            {item.bill_type_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.total_count}</TableCell>
                        <TableCell className="text-right text-green-600">{item.initial_count}</TableCell>
                        <TableCell className="text-right text-red-600">{item.critical_count}</TableCell>
                        <TableCell className="text-right">
                          <span className={item.critical_count > 0 ? 'text-red-600' : 'text-muted-foreground'}>
                            {criticalPercent}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}