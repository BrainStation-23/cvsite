
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3 } from 'lucide-react';
import { ChartViewSelector, ChartView } from './ChartViewSelector';
import { BillTypeChartView } from './BillTypeChartView';

interface SbuData {
  id: string;
  name: string;
  totalResources: number;
  billTypeDistribution: Array<{ name: string; value: number; percentage: number }>;
}

interface SbuDashboardProps {
  sbuData: SbuData;
  loading?: boolean;
}

const COLORS = [
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

export const SbuDashboard: React.FC<SbuDashboardProps> = ({ sbuData, loading = false }) => {
  const [chartView, setChartView] = useState<ChartView>('pie');

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Users className="h-5 w-5" />
        {sbuData.name} Dashboard
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resource Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{sbuData.totalResources}</div>
                <div className="text-sm text-muted-foreground">Total Resources</div>
              </div>

              {sbuData.billTypeDistribution.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Bill Type Breakdown:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {sbuData.billTypeDistribution.map((item, index) => (
                      <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="truncate" title={item.name}>{item.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="font-medium">{item.value}</span>
                          <span className="text-muted-foreground ml-1">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bill Type Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Bill Type Distribution
              </div>
              <ChartViewSelector 
                currentView={chartView}
                onViewChange={setChartView}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sbuData.billTypeDistribution.length > 0 ? (
              <BillTypeChartView
                data={sbuData.billTypeDistribution}
                view={chartView}
                colors={COLORS}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No bill type data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
