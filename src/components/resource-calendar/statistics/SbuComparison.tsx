
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

interface SbuData {
  id: string;
  name: string;
  totalResources: number;
  billTypeDistribution: Array<{ name: string; value: number; percentage: number }>;
}

interface SbuComparisonProps {
  primarySbu: SbuData;
  comparisonSbu: SbuData;
  loading?: boolean;
}

const PRIMARY_COLOR = '#8b5cf6'; // purple
const COMPARISON_COLOR = '#06b6d4'; // cyan

export const SbuComparison: React.FC<SbuComparisonProps> = ({ 
  primarySbu, 
  comparisonSbu, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create comparison data for chart
  const getAllBillTypes = () => {
    const allTypes = new Set<string>();
    primarySbu.billTypeDistribution.forEach(item => allTypes.add(item.name));
    comparisonSbu.billTypeDistribution.forEach(item => allTypes.add(item.name));
    return Array.from(allTypes);
  };

  const comparisonData = getAllBillTypes().map(billType => {
    const primaryValue = primarySbu.billTypeDistribution.find(item => item.name === billType)?.value || 0;
    const comparisonValue = comparisonSbu.billTypeDistribution.find(item => item.name === billType)?.value || 0;
    
    return {
      billType,
      [primarySbu.name]: primaryValue,
      [comparisonSbu.name]: comparisonValue,
    };
  });

  const resourceDifference = primarySbu.totalResources - comparisonSbu.totalResources;
  const resourceDifferencePercentage = comparisonSbu.totalResources > 0 
    ? ((resourceDifference / comparisonSbu.totalResources) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="h-5 w-5" />
        SBU Comparison: {primarySbu.name} vs {comparisonSbu.name}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Count Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Resource Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  />
                  <span className="text-sm font-medium">{primarySbu.name}</span>
                </div>
                <span className="text-lg font-bold">{primarySbu.totalResources}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COMPARISON_COLOR }}
                  />
                  <span className="text-sm font-medium">{comparisonSbu.name}</span>
                </div>
                <span className="text-lg font-bold">{comparisonSbu.totalResources}</span>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Difference</span>
                <div className="text-right">
                  <div className={`font-medium ${resourceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {resourceDifference >= 0 ? '+' : ''}{resourceDifference}
                  </div>
                  <div className={`text-xs ${resourceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({resourceDifferencePercentage >= 0 ? '+' : ''}{resourceDifferencePercentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary SBU Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PRIMARY_COLOR }}
              />
              {primarySbu.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {primarySbu.billTypeDistribution.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span>{item.name}</span>
                  <div className="text-right">
                    <span className="font-medium">{item.value}</span>
                    <span className="text-muted-foreground ml-1">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison SBU Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COMPARISON_COLOR }}
              />
              {comparisonSbu.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparisonSbu.billTypeDistribution.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span>{item.name}</span>
                  <div className="text-right">
                    <span className="font-medium">{item.value}</span>
                    <span className="text-muted-foreground ml-1">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bill Type Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bill Type Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              [primarySbu.name]: {
                label: primarySbu.name,
                color: PRIMARY_COLOR,
              },
              [comparisonSbu.name]: {
                label: comparisonSbu.name,
                color: COMPARISON_COLOR,
              },
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <XAxis 
                  dataKey="billType" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => (
                    <span style={{ 
                      color: value === primarySbu.name ? PRIMARY_COLOR : COMPARISON_COLOR 
                    }}>
                      {value}
                    </span>
                  )}
                />
                <Bar dataKey={primarySbu.name} fill={PRIMARY_COLOR} />
                <Bar dataKey={comparisonSbu.name} fill={COMPARISON_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
