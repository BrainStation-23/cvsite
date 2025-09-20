import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/statistics/ViewToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Grid2X2, BarChart3, PieChart as PieIcon } from 'lucide-react';

interface SBUExperienceDistribution {
  sbu_id: string;
  sbu_name: string;
  sbu_color_code?: string;
  experience_distribution: {
    junior: number;
    mid: number;
    senior: number;
    lead: number;
    unknown: number;
    total_count: number;
  };
}

interface SBUExperienceDistributionChartProps {
  data: SBUExperienceDistribution[];
  isLoading: boolean;
  title?: string;
}

const EXPERIENCE_COLORS = {
  junior: 'hsl(var(--chart-2))', // Green for junior
  mid: 'hsl(var(--chart-1))', // Blue for mid
  senior: 'hsl(var(--chart-3))', // Purple for senior
  lead: 'hsl(var(--chart-4))', // Pink for lead
  unknown: 'hsl(var(--chart-5))', // Gray for unknown
};

type ViewMode = 'stacked-bar' | 'grid-pie' | 'table';

export function SBUExperienceDistributionChart({ data, isLoading, title }: SBUExperienceDistributionChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('stacked-bar');

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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {title || 'SBU Experience Distribution'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No SBU experience data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for stacked bar chart
  const stackedBarData = data.map(sbu => ({
    sbu_name: sbu.sbu_name,
    junior: sbu.experience_distribution.junior,
    mid: sbu.experience_distribution.mid,
    senior: sbu.experience_distribution.senior,
    lead: sbu.experience_distribution.lead,
    unknown: sbu.experience_distribution.unknown,
    total: sbu.experience_distribution.total_count,
  }));

  // Transform data for individual pie charts
  const gridPieData = data.map(sbu => ({
    sbu_name: sbu.sbu_name,
    sbu_color: sbu.sbu_color_code || 'hsl(var(--primary))',
    total: sbu.experience_distribution.total_count,
    pieData: [
      { name: 'Junior', value: sbu.experience_distribution.junior, color: EXPERIENCE_COLORS.junior },
      { name: 'Mid', value: sbu.experience_distribution.mid, color: EXPERIENCE_COLORS.mid },
      { name: 'Senior', value: sbu.experience_distribution.senior, color: EXPERIENCE_COLORS.senior },
      { name: 'Lead', value: sbu.experience_distribution.lead, color: EXPERIENCE_COLORS.lead },
      { name: 'Unknown', value: sbu.experience_distribution.unknown, color: EXPERIENCE_COLORS.unknown },
    ].filter(item => item.value > 0)
  }));

  // Transform data for table view
  const tableData = data.flatMap(sbu => [
    {
      sbu_name: sbu.sbu_name,
      level: 'Junior',
      count: sbu.experience_distribution.junior,
      percentage: sbu.experience_distribution.total_count ? Math.round((sbu.experience_distribution.junior / sbu.experience_distribution.total_count) * 100) : 0,
      color: EXPERIENCE_COLORS.junior,
      sbu_total: sbu.experience_distribution.total_count,
    },
    {
      sbu_name: sbu.sbu_name,
      level: 'Mid',
      count: sbu.experience_distribution.mid,
      percentage: sbu.experience_distribution.total_count ? Math.round((sbu.experience_distribution.mid / sbu.experience_distribution.total_count) * 100) : 0,
      color: EXPERIENCE_COLORS.mid,
      sbu_total: sbu.experience_distribution.total_count,
    },
    {
      sbu_name: sbu.sbu_name,
      level: 'Senior',
      count: sbu.experience_distribution.senior,
      percentage: sbu.experience_distribution.total_count ? Math.round((sbu.experience_distribution.senior / sbu.experience_distribution.total_count) * 100) : 0,
      color: EXPERIENCE_COLORS.senior,
      sbu_total: sbu.experience_distribution.total_count,
    },
    {
      sbu_name: sbu.sbu_name,
      level: 'Lead',
      count: sbu.experience_distribution.lead,
      percentage: sbu.experience_distribution.total_count ? Math.round((sbu.experience_distribution.lead / sbu.experience_distribution.total_count) * 100) : 0,
      color: EXPERIENCE_COLORS.lead,
      sbu_total: sbu.experience_distribution.total_count,
    },
    {
      sbu_name: sbu.sbu_name,
      level: 'Unknown',
      count: sbu.experience_distribution.unknown,
      percentage: sbu.experience_distribution.total_count ? Math.round((sbu.experience_distribution.unknown / sbu.experience_distribution.total_count) * 100) : 0,
      color: EXPERIENCE_COLORS.unknown,
      sbu_total: sbu.experience_distribution.total_count,
    },
  ]).filter(item => item.count > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Count: <span className="font-medium">{data.value}</span></p>
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
              {title || 'SBU Experience Distribution'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Experience levels grouped by Strategic Business Unit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stacked-bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Stacked Bar
                  </div>
                </SelectItem>
                <SelectItem value="grid-pie">
                  <div className="flex items-center gap-2">
                    <Grid2X2 className="h-4 w-4" />
                    Grid View
                  </div>
                </SelectItem>
                <SelectItem value="table">
                  <div className="flex items-center gap-2">
                    <PieIcon className="h-4 w-4" />
                    Table
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'stacked-bar' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedBarData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="sbu_name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="junior" stackId="a" fill={EXPERIENCE_COLORS.junior} name="Junior" />
                <Bar dataKey="mid" stackId="a" fill={EXPERIENCE_COLORS.mid} name="Mid" />
                <Bar dataKey="senior" stackId="a" fill={EXPERIENCE_COLORS.senior} name="Senior" />
                <Bar dataKey="lead" stackId="a" fill={EXPERIENCE_COLORS.lead} name="Lead" />
                <Bar dataKey="unknown" stackId="a" fill={EXPERIENCE_COLORS.unknown} name="Unknown" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'grid-pie' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPieData.map((sbu) => (
              <div key={sbu.sbu_name} className="text-center">
                <h4 className="font-medium mb-3 text-sm">{sbu.sbu_name}</h4>
                <div className="h-32 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sbu.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        dataKey="value"
                      >
                        {sbu.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {sbu.total} resources
                </p>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'table' && (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SBU</TableHead>
                  <TableHead>Experience Level</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item, index) => (
                  <TableRow key={`${item.sbu_name}-${item.level}`}>
                    <TableCell className="font-medium">{item.sbu_name}</TableCell>
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
                {/* SBU Totals */}
                {data.map((sbu) => (
                  <TableRow key={`${sbu.sbu_name}-total`} className="font-medium bg-muted/50">
                    <TableCell>{sbu.sbu_name}</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{sbu.experience_distribution.total_count}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
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