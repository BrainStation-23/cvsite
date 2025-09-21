import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/statistics/ViewToggle';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SBUExpertiseData {
  sbu_id: string;
  sbu_name: string;
  sbu_color_code?: string;
  expertise_id: string;
  expertise_name: string;
  total_count: number;
  initial_count: number;
  critical_count: number;
}

interface SBUExpertiseAnalysisChartProps {
  data: SBUExpertiseData[];
  isLoading: boolean;
  title?: string;
}

export function SBUExpertiseAnalysisChart({ 
  data, 
  isLoading, 
  title 
}: SBUExpertiseAnalysisChartProps) {
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
            {title || 'SBU-Expertise Analysis'}
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
        expertises: []
      };
    }
    acc[item.sbu_id].total_count += item.total_count;
    acc[item.sbu_id].initial_count += item.initial_count;
    acc[item.sbu_id].critical_count += item.critical_count;
    acc[item.sbu_id].expertises.push(item);
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
              {title || 'SBU-Expertise Analysis'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Non-billed resources breakdown by SBU and expertise
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
          <div className="h-full overflow-auto">
            {(() => {
              // Get unique expertises and SBUs
              const expertises = Array.from(new Set(data.map(item => item.expertise_name))).sort();
              const sbus = Array.from(new Set(data.map(item => item.sbu_name))).sort();
              
              // Create a map for quick lookup
              const dataMap = new Map();
              data.forEach(item => {
                const key = `${item.expertise_name}-${item.sbu_name}`;
                dataMap.set(key, item);
              });

              // Calculate totals
              const sbuTotals = sbus.map(sbu => {
                return data
                  .filter(item => item.sbu_name === sbu)
                  .reduce((sum, item) => sum + item.total_count, 0);
              });

              const expertiseTotals = expertises.map(expertise => {
                return data
                  .filter(item => item.expertise_name === expertise)
                  .reduce((sum, item) => sum + item.total_count, 0);
              });

              const grandTotal = data.reduce((sum, item) => sum + item.total_count, 0);

              return (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-medium">Expertise</TableHead>
                      {sbus.map(sbu => (
                        <TableHead key={sbu} className="text-center font-medium">
                          {sbu}
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-medium bg-muted">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expertises.map((expertise, expertiseIndex) => (
                      <TableRow key={expertise}>
                        <TableCell className="font-medium">{expertise}</TableCell>
                        {sbus.map(sbu => {
                          const item = dataMap.get(`${expertise}-${sbu}`);
                          if (!item) {
                            return <TableCell key={sbu} className="text-center text-muted-foreground">-</TableCell>;
                          }
                          
                          return (
                            <TableCell key={sbu} className="text-center">
                              <div 
                                className="cursor-help font-medium"
                                title={`Initial (<30d): ${item.initial_count}\nCritical (>60d): ${item.critical_count}`}
                              >
                                {item.total_count}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium bg-muted">
                          {expertiseTotals[expertiseIndex]}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted font-medium">
                      <TableCell className="font-semibold">Total</TableCell>
                      {sbuTotals.map((total, index) => (
                        <TableCell key={index} className="text-center font-semibold">
                          {total}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">
                        {grandTotal}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}