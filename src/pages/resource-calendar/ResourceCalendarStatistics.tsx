
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, PieChart, Users, Building, Award, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StatisticsCard } from '@/components/resource-calendar/statistics/StatisticsCard';
import { DistributionChart } from '@/components/resource-calendar/statistics/DistributionChart';
import { SummaryStats } from '@/components/resource-calendar/statistics/SummaryStats';

interface DistributionData {
  name: string;
  value: number;
}

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [distributionData, setDistributionData] = useState<{
    billTypes: DistributionData[];
    expertiseTypes: DistributionData[];
    projectTypes: DistributionData[];
    resourceTypes: DistributionData[];
    sbuTypes: DistributionData[];
  }>({
    billTypes: [],
    expertiseTypes: [],
    projectTypes: [],
    resourceTypes: [],
    sbuTypes: []
  });

  const fetchDistributionData = async () => {
    try {
      setLoading(true);
      
      const [billTypesResult, expertiseTypesResult, projectTypesResult, resourceTypesResult, sbuResult] = await Promise.all([
        supabase.rpc('get_resource_distribution_by_bill_types'),
        supabase.rpc('get_resource_distribution_by_expertise_types'),
        supabase.rpc('get_resource_distribution_by_project_types'),
        supabase.rpc('get_resource_distribution_by_resource_types'),
        supabase.rpc('get_resource_distribution_by_sbu')
      ]);

      if (billTypesResult.error) throw billTypesResult.error;
      if (expertiseTypesResult.error) throw expertiseTypesResult.error;
      if (projectTypesResult.error) throw projectTypesResult.error;
      if (resourceTypesResult.error) throw resourceTypesResult.error;
      if (sbuResult.error) throw sbuResult.error;

      setDistributionData({
        billTypes: billTypesResult.data?.map((item: any) => ({ name: item.bill_type, value: Number(item.count) })) || [],
        expertiseTypes: expertiseTypesResult.data?.map((item: any) => ({ name: item.expertise_type, value: Number(item.count) })) || [],
        projectTypes: projectTypesResult.data?.map((item: any) => ({ name: item.project_type, value: Number(item.count) })) || [],
        resourceTypes: resourceTypesResult.data?.map((item: any) => ({ name: item.resource_type, value: Number(item.count) })) || [],
        sbuTypes: sbuResult.data?.map((item: any) => ({ name: item.sbu_name, value: Number(item.count) })) || []
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching distribution data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch distribution data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributionData();
  }, []);

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Category', 'Type', 'Count'],
      ...distributionData.billTypes.map(item => ['Bill Types', item.name, item.value]),
      ...distributionData.expertiseTypes.map(item => ['Expertise Types', item.name, item.value]),
      ...distributionData.projectTypes.map(item => ['Project Types', item.name, item.value]),
      ...distributionData.resourceTypes.map(item => ['Resource Types', item.name, item.value]),
      ...distributionData.sbuTypes.map(item => ['SBU', item.name, item.value])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resource-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Report exported successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link to={baseUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resource Calendar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Resource Distribution Analytics</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>Analyze resource distribution patterns across different categories</span>
                {lastUpdated && (
                  <span>• Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDistributionData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <SummaryStats distributionData={distributionData} />

        {/* Distribution Charts in Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bill-types">Bill Types</TabsTrigger>
            <TabsTrigger value="expertise">Expertise</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="sbu">SBU</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatisticsCard title="Bill Types Distribution" icon={BarChart3}>
                <DistributionChart 
                  data={distributionData.billTypes} 
                  loading={loading}
                  emptyMessage="No bill type data available"
                />
              </StatisticsCard>

              <StatisticsCard title="Resource Types Distribution" icon={Users}>
                <DistributionChart 
                  data={distributionData.resourceTypes} 
                  loading={loading}
                  emptyMessage="No resource type data available"
                />
              </StatisticsCard>

              <StatisticsCard title="SBU Distribution" icon={Building}>
                <DistributionChart 
                  data={distributionData.sbuTypes} 
                  loading={loading}
                  emptyMessage="No SBU data available"
                />
              </StatisticsCard>

              <StatisticsCard title="Project Types Distribution" icon={PieChart}>
                <DistributionChart 
                  data={distributionData.projectTypes} 
                  loading={loading}
                  emptyMessage="No project type data available"
                />
              </StatisticsCard>
            </div>
          </TabsContent>

          <TabsContent value="bill-types">
            <StatisticsCard title="Bill Types Distribution" icon={BarChart3} className="w-full">
              <DistributionChart 
                data={distributionData.billTypes} 
                loading={loading}
                emptyMessage="No bill type data available"
              />
            </StatisticsCard>
          </TabsContent>

          <TabsContent value="expertise">
            <StatisticsCard title="Expertise Types Distribution" icon={Award} className="w-full">
              <DistributionChart 
                data={distributionData.expertiseTypes} 
                loading={loading}
                emptyMessage="No expertise type data available"
              />
            </StatisticsCard>
          </TabsContent>

          <TabsContent value="projects">
            <StatisticsCard title="Project Types Distribution" icon={PieChart} className="w-full">
              <DistributionChart 
                data={distributionData.projectTypes} 
                loading={loading}
                emptyMessage="No project type data available"
              />
            </StatisticsCard>
          </TabsContent>

          <TabsContent value="resources">
            <StatisticsCard title="Resource Types Distribution" icon={Users} className="w-full">
              <DistributionChart 
                data={distributionData.resourceTypes} 
                loading={loading}
                emptyMessage="No resource type data available"
              />
            </StatisticsCard>
          </TabsContent>

          <TabsContent value="sbu">
            <StatisticsCard title="SBU Distribution" icon={Building} className="w-full">
              <DistributionChart 
                data={distributionData.sbuTypes} 
                loading={loading}
                emptyMessage="No SBU data available"
              />
            </StatisticsCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
