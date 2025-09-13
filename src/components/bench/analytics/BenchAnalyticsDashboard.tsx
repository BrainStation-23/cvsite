import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Calendar, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';
import { addDays, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { 
  useBenchOverview, 
  useBenchDimensionalAnalysis, 
  useBenchRiskAnalytics, 
  useBenchTrendsAnalysis 
} from '@/hooks/use-bench-analytics';

import { OverviewCards } from './OverviewCards';
import { ExperienceDistributionChart } from './ExperienceDistributionChart';
import { DimensionalAnalysisChart } from './DimensionalAnalysisChart';
import { RiskAnalytics } from './RiskAnalytics';
import { TrendsChart } from './TrendsChart';


export function BenchAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [dimensionType, setDimensionType] = useState<'sbu' | 'expertise' | 'bill_type'>('sbu');
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Fetch analytics data
  const overviewQuery = useBenchOverview({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const dimensionalQuery = useBenchDimensionalAnalysis(dimensionType, {
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const riskQuery = useBenchRiskAnalytics(30);
  const trendsQuery = useBenchTrendsAnalysis(periodType, 365);

  const isLoading = overviewQuery.isLoading || dimensionalQuery.isLoading || 
                   riskQuery.isLoading || trendsQuery.isLoading;

  const handleRefresh = () => {
    overviewQuery.refetch();
    dimensionalQuery.refetch();
    riskQuery.refetch();
    trendsQuery.refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bench Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into bench metrics and workforce management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select date range"
            className="w-64"
          />
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overviewQuery.data && (
        <OverviewCards 
          data={overviewQuery.data} 
          isLoading={overviewQuery.isLoading} 
        />
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Management
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Distribution */}
            {overviewQuery.data && (
              <ExperienceDistributionChart
                data={overviewQuery.data.experience_distribution}
                isLoading={overviewQuery.isLoading}
              />
            )}

            {/* Quick dimensional preview */}
            {dimensionalQuery.data && (
              <DimensionalAnalysisChart
                data={dimensionalQuery.data}
                isLoading={dimensionalQuery.isLoading}
                dimension={dimensionType}
                onDimensionChange={setDimensionType}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {dimensionalQuery.data && (
            <DimensionalAnalysisChart
              data={dimensionalQuery.data}
              isLoading={dimensionalQuery.isLoading}
              dimension={dimensionType}
              onDimensionChange={setDimensionType}
            />
          )}
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          {riskQuery.data && (
            <RiskAnalytics
              data={riskQuery.data}
              isLoading={riskQuery.isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {trendsQuery.data && (
            <TrendsChart
              data={trendsQuery.data}
              isLoading={trendsQuery.isLoading}
              periodType={periodType}
              onPeriodChange={setPeriodType}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}