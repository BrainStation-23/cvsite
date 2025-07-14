
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, TrendingUp, Users, ArrowLeft, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DistributionData {
  name: string;
  value: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchDistributionData();
  }, []);

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

  const renderPieChart = (data: DistributionData[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-2">
              {data.map((item, index) => {
                const total = data.reduce((sum, d) => sum + d.value, 0);
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{item.value}</span>
                      <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderBarChart = (data: DistributionData[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-3">
              {data.map((item, index) => {
                const maxValue = Math.max(...data.map(d => d.value));
                const widthPercentage = (item.value / maxValue) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.value}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={baseUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resource Calendar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Resource Distribution Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Analyze resource distribution patterns across different categories
              </p>
            </div>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Distribution Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {renderPieChart(distributionData.billTypes, 'Distribution by Bill Types')}
          {renderBarChart(distributionData.expertiseTypes, 'Distribution by Expertise Types')}
          {renderPieChart(distributionData.projectTypes, 'Distribution by Project Types')}
          {renderBarChart(distributionData.resourceTypes, 'Distribution by Resource Types')}
          {renderPieChart(distributionData.sbuTypes, 'Distribution by SBU')}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
