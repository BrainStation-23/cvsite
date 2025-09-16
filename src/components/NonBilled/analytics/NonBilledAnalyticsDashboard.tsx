import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        
        <div className="flex items-center gap-3">
          <DateRangePickerWithPresets
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={({ startDate: newStartDate, endDate: newEndDate }) => {
              setStartDate(newStartDate);
              setEndDate(newEndDate);
            }}
          />
          
          <Select value={benchFilter === null ? 'all' : benchFilter ? 'bench' : 'non-bench'} onValueChange={(value) => {
            setBenchFilter(value === 'all' ? null : value === 'bench');
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="bench">Bench Only</SelectItem>
              <SelectItem value="non-bench">Non-Bench Only</SelectItem>
            </SelectContent>
          </Select>
          
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Distribution */}
            {overviewQuery.data && (
              <ExperienceDistributionChart
                data={{...overviewQuery.data.experience_distribution, total_count: overviewQuery.data.overview.total_non_billed_resources_count}}
                isLoading={overviewQuery.isLoading}
              />
            )}

            {/* SBU Analysis Preview */}
            {sbuQuery.data && (
              <DimensionalAnalysisChart
                data={sbuQuery.data}
                isLoading={sbuQuery.isLoading}
                dimension="sbu"
                title="Non Billed Analysis by SBU (Preview)"
              />
            )}
            
            {/* Expertise Analysis */}
            {expertiseQuery.data && (
              <DimensionalAnalysisChart
                data={expertiseQuery.data}
                isLoading={expertiseQuery.isLoading}
                dimension="expertise"
                title="Non Billed Analysis by Expertise"
              />
            )}

            {/* Bill Type Analysis */}
            {billTypeQuery.data && (
              <DimensionalAnalysisChart
                data={billTypeQuery.data}
                isLoading={billTypeQuery.isLoading}
                dimension="bill_type"
                title="Non Billed Analysis by Bill Type"
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