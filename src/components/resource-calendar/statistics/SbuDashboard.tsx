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
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-80 bg-muted rounded"></div>
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

      {/* Merged Resource Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resource Overview
            </div>
            <ChartViewSelector 
              currentView={chartView}
              onViewChange={setChartView}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Resources Summary */}
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">{sbuData.totalResources}</div>
                <div className="text-sm text-muted-foreground">Total Resources</div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="lg:col-span-2">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
