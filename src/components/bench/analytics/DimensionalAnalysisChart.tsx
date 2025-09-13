import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  onDimensionChange: (dimension: 'sbu' | 'expertise' | 'bill_type') => void;
}

export function DimensionalAnalysisChart({ 
  data, 
  isLoading, 
  dimension, 
  onDimensionChange 
}: DimensionalAnalysisChartProps) {
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
              Bench Analysis by {dimensionLabels[dimension]}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of bench metrics across different {dimensionLabels[dimension].toLowerCase()}s
            </p>
          </div>
          <Select value={dimension} onValueChange={onDimensionChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sbu">SBU</SelectItem>
              <SelectItem value="expertise">Expertise</SelectItem>
              <SelectItem value="bill_type">Bill Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}