import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateRangePickerWithPresets } from '@/components/statistics/DateRangePickerWithPresets';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

import { 
  useNonBilledOverview, 
  useNonBilledDimensionalAnalysis, 
  useNonBilledRiskAnalytics, 
  useNonBilledTrendsAnalysis,
  useNonBilledPivotStatistics
} from '@/hooks/use-non-billed-analytics';

import { OverviewCards } from './OverviewCards';
import { ExperienceDistributionChart } from './ExperienceDistributionChart';
import { DimensionalAnalysisChart } from './DimensionalAnalysisChart';
import { RiskAnalytics } from './RiskAnalytics';
import { TrendsChart } from './TrendsChart';
import { NonBilledPivotTableContainer } from './NonBilledPivotTableContainer';


export function NonBilledAnalyticsDashboard() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [benchFilter, setBenchFilter] = useState<boolean | null>(null);
  
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Pivot table filters
  const [pivotFilters, setPivotFilters] = useState({
    sbuFilter: null as string | null,
    billTypeFilter: null as string | null,
    expertiseTypeFilter: null as string | null,
  });

  // Fetch analytics data
  const overviewQuery = useNonBilledOverview({
    startDate,
    endDate,
    benchFilter,
  });

  const sbuQuery = useNonBilledDimensionalAnalysis('sbu', {
    startDate,
    endDate,
    benchFilter,
  });

  const expertiseQuery = useNonBilledDimensionalAnalysis('expertise', {
    startDate,
    endDate,
    benchFilter,
  });

  const billTypeQuery = useNonBilledDimensionalAnalysis('bill_type', {
    startDate,
    endDate,
    benchFilter,
  });

  const riskQuery = useNonBilledRiskAnalytics(30, benchFilter);
  const trendsQuery = useNonBilledTrendsAnalysis(periodType, 365, benchFilter);

  // Pivot statistics query
  const pivotQuery = useNonBilledPivotStatistics(
    'sbu',
    'bill_type',
    {
      ...pivotFilters,
      startDate,
      endDate,
    },
    false
  );

  const isLoading = overviewQuery.isLoading || sbuQuery.isLoading || 
                   expertiseQuery.isLoading || billTypeQuery.isLoading ||
                   riskQuery.isLoading || trendsQuery.isLoading || pivotQuery.isLoading;

  const handleRefresh = () => {
    overviewQuery.refetch();
    sbuQuery.refetch();
    expertiseQuery.refetch();
    billTypeQuery.refetch();
    riskQuery.refetch();
    trendsQuery.refetch();
    pivotQuery.refetch();
  };

  const handlePivotFiltersChange = (newFilters: any) => {
    setPivotFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearPivotFilters = () => {
    setPivotFilters({
      sbuFilter: null,
      billTypeFilter: null,
      expertiseTypeFilter: null,
    });
  };


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Non-Billed Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into non-billed metrics and workforce management
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <DateRangePickerWithPresets
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={({ startDate: newStartDate, endDate: newEndDate }) => {
              setStartDate(newStartDate);
              setEndDate(newEndDate);
            }}
          />
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background">
            <Label className="text-sm font-medium">Filter:</Label>
            <Select
              value={benchFilter === true ? 'bench' : benchFilter === false ? 'non-bench' : 'all'}
              onValueChange={(value) => {
                if (value === 'bench') setBenchFilter(true);
                else if (value === 'non-bench') setBenchFilter(false);
                else setBenchFilter(null);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="bench">Bench Only</SelectItem>
                <SelectItem value="non-bench">Non-Bench Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {overviewQuery.data && (
        <OverviewCards 
          data={overviewQuery.data} 
          isLoading={overviewQuery.isLoading}
          benchFilter={benchFilter}
        />
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
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
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Non-Billed Resources Cross-Dimensional Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Interactive pivot table showing count, average duration, initial resources (&lt;30 days), and critical resources (&gt;60 days)
              {benchFilter === true ? ' - Showing bench resources only' : 
               benchFilter === false ? ' - Showing non-bench resources only' : 
               ' - Showing all non-billed resources'}
            </p>
          </div>

          {/* Pivot Table Container */}
          <div className="bg-card border rounded-lg">
            <NonBilledPivotTableContainer
              filters={pivotFilters}
              onFiltersChange={handlePivotFiltersChange}
              onClearFilters={handleClearPivotFilters}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskAnalytics
            data={riskQuery.data}
            isLoading={riskQuery.isLoading}
          />
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