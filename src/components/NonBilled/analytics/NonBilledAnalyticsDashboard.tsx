import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DateRangePickerWithPresets } from '@/components/statistics/DateRangePickerWithPresets';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Calendar, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

import { 
  useNonBilledOverview, 
  useNonBilledDimensionalAnalysis, 
  useNonBilledRiskAnalytics, 
  useNonBilledTrendsAnalysis 
} from '@/hooks/use-non-billed-analytics';

import { OverviewCards } from './OverviewCards';
import { ExperienceDistributionChart } from './ExperienceDistributionChart';
import { DimensionalAnalysisChart } from './DimensionalAnalysisChart';
import { RiskAnalytics } from './RiskAnalytics';
import { TrendsChart } from './TrendsChart';


export function NonBilledAnalyticsDashboard() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [benchFilter, setBenchFilter] = useState<boolean | null>(null);
  
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

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

  const isLoading = overviewQuery.isLoading || sbuQuery.isLoading || 
                   expertiseQuery.isLoading || billTypeQuery.isLoading ||
                   riskQuery.isLoading || trendsQuery.isLoading;

  const handleRefresh = () => {
    overviewQuery.refetch();
    sbuQuery.refetch();
    expertiseQuery.refetch();
    billTypeQuery.refetch();
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
            <Label htmlFor="bench-toggle" className="text-sm font-medium">
              {benchFilter ? 'Bench Only' : 'All Resources'}
            </Label>
            <Switch
              id="bench-toggle"
              checked={benchFilter === true}
              onCheckedChange={(checked) => setBenchFilter(checked ? true : null)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
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
            <h2 className="text-xl font-semibold">Experience Distribution</h2>
            <p className="text-sm text-muted-foreground">
              {benchFilter ? 'Showing bench resources only' : 'Showing all non-billed resources'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Distribution */}
            <div>
              {overviewQuery.data && (
                <ExperienceDistributionChart
                  data={{
                    ...overviewQuery.data.experience_distribution,
                    total_count: overviewQuery.data.overview.total_non_billed_resources_count
                  }}
                  isLoading={overviewQuery.isLoading}
                />
              )}
            </div>

            {/* SBU Analysis Preview */}
            {sbuQuery.data && (
              <DimensionalAnalysisChart
                data={sbuQuery.data}
                isLoading={sbuQuery.isLoading}
                dimension="sbu"
                title={`Non Billed Analysis by SBU${benchFilter ? " (Bench Only)" : ""}`}
              />
            )}
            
            {/* Expertise Analysis */}
            {expertiseQuery.data && (
              <DimensionalAnalysisChart
                data={expertiseQuery.data}
                isLoading={expertiseQuery.isLoading}
                dimension="expertise"
                title={`Non Billed Analysis by Expertise${benchFilter ? " (Bench Only)" : ""}`}
              />
            )}

            {/* Bill Type Analysis */}
            {billTypeQuery.data && (
              <DimensionalAnalysisChart
                data={billTypeQuery.data}
                isLoading={billTypeQuery.isLoading}
                dimension="bill_type"
                title={`Non Billed Analysis by Bill Type${benchFilter ? " (Bench Only)" : ""}`}
              />
            )}
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