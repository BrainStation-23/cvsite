import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateRangePickerWithPresets } from '@/components/statistics/DateRangePickerWithPresets';
import { BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

import { 
  useNonBilledOverview, 
  useNonBilledDimensionalAnalysis, 
  useNonBilledRiskAnalytics, 
  useNonBilledTrendsAnalysis,
  useNonBilledSBUDimensionalAnalysis
} from '@/hooks/use-non-billed-analytics';

import { OverviewCards } from './OverviewCards';
import { SBUExperienceDistributionChart } from './SBUExperienceDistributionChart';
import { DimensionalAnalysisChart } from './DimensionalAnalysisChart';
import { SBUExpertiseAnalysisChart } from './SBUExpertiseAnalysisChart';
import { SBUBillTypeAnalysisChart } from './SBUBillTypeAnalysisChart';
import { RiskAnalytics } from './RiskAnalytics';
import { TrendsChart } from './TrendsChart';


export function NonBilledAnalyticsDashboard() {
  const [startDate, setStartDate] = useState<Date | null>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState<Date | null>(endOfWeek(new Date(), { weekStartsOn: 1 }));
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

  const sbuDimensionalQuery = useNonBilledSBUDimensionalAnalysis({
    startDate,
    endDate,
    benchFilter,
  });

  const riskQuery = useNonBilledRiskAnalytics(30, benchFilter);
  const trendsQuery = useNonBilledTrendsAnalysis(periodType, 365, benchFilter);


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
            <h2 className="text-xl font-semibold">Non-Billed Overview</h2>
            <p className="text-sm text-muted-foreground">
              {benchFilter === true ? 'Showing bench resources only' : 
               benchFilter === false ? 'Showing non-bench resources only' : 
               'Showing all non-billed resources'}
            </p>
          </div>

          <div className="space-y-6">


            {/* Dimensional Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* SBU Analysis */}
              {sbuQuery.data && (
                <DimensionalAnalysisChart
                  data={sbuQuery.data}
                  isLoading={sbuQuery.isLoading}
                  dimension="sbu"
                  title={`Non Billed Analysis by SBU${
                    benchFilter === true ? " (Bench Only)" : 
                    benchFilter === false ? " (Non-Bench Only)" : ""
                  }`}
                />
              )}
              
              {/* Expertise Analysis */}
              {expertiseQuery.data && (
                <DimensionalAnalysisChart
                  data={expertiseQuery.data}
                  isLoading={expertiseQuery.isLoading}
                  dimension="expertise"
                  title={`Non Billed Analysis by Expertise${
                    benchFilter === true ? " (Bench Only)" : 
                    benchFilter === false ? " (Non-Bench Only)" : ""
                  }`}
                />
              )}

              {/* Bill Type Analysis */}
              {billTypeQuery.data && (
                <DimensionalAnalysisChart
                  data={billTypeQuery.data}
                  isLoading={billTypeQuery.isLoading}
                  dimension="bill_type"
                  title={`Non Billed Analysis by Bill Type${
                    benchFilter === true ? " (Bench Only)" : 
                    benchFilter === false ? " (Non-Bench Only)" : ""
                  }`}
                />
              )}
            </div>


            {/* Experience Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             
              <SBUExperienceDistributionChart
                data={overviewQuery.data?.sbu_experience_distribution || []}
                isLoading={overviewQuery.isLoading}
                title="SBU Experience Breakdown"
              />
            </div>

            {/* SBU Dimensional Analysis */}
            <div className="space-y-6">

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* SBU-Expertise Analysis */}
                {sbuDimensionalQuery.data?.expertise_analysis && (
                  <SBUExpertiseAnalysisChart
                    data={sbuDimensionalQuery.data.expertise_analysis}
                    isLoading={sbuDimensionalQuery.isLoading}
                    title={`SBU-Expertise Analysis${
                      benchFilter === true ? " (Bench Only)" : 
                      benchFilter === false ? " (Non-Bench Only)" : ""
                    }`}
                  />
                )}

                {/* SBU-Bill Type Analysis */}
                {sbuDimensionalQuery.data?.bill_type_analysis && (
                  <SBUBillTypeAnalysisChart
                    data={sbuDimensionalQuery.data.bill_type_analysis}
                    isLoading={sbuDimensionalQuery.isLoading}
                    title={`SBU-Bill Type Analysis${
                      benchFilter === true ? " (Bench Only)" : 
                      benchFilter === false ? " (Non-Bench Only)" : ""
                    }`}
                  />
                )}
              </div>
            </div>
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