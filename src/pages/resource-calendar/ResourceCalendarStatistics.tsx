import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SbuDashboard } from '@/components/resource-calendar/statistics/SbuDashboard';
import { SbuComparison } from '@/components/resource-calendar/statistics/SbuComparison';

interface SbuData {
  id: string;
  name: string;
  totalResources: number;
  billTypeDistribution: Array<{ name: string; value: number; percentage: number }>;
}

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sbuData, setSbuData] = useState<SbuData[]>([]);
  const [selectedSbu, setSelectedSbu] = useState<string>('');
  const [comparisonSbu, setComparisonSbu] = useState<string>('none');

  const fetchSbuAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all SBUs with their resource counts and bill type distributions
      const { data: sbus, error: sbuError } = await supabase
        .from('sbus')
        .select('id, name')
        .order('name');

      if (sbuError) throw sbuError;

      const sbuAnalytics: SbuData[] = [];

      for (const sbu of sbus) {
        // Get total resources for this SBU
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('sbu_id', sbu.id);

        if (profilesError) throw profilesError;

        const totalResources = profiles?.length || 0;

        // Get bill type distribution for this SBU
        const { data: resourcePlanning, error: rpError } = await supabase
          .from('resource_planning')
          .select(`
            bill_type_id,
            bill_types (
              name
            ),
            profile_id
          `)
          .in('profile_id', profiles?.map(p => p.id) || [])
          .eq('engagement_complete', false);

        if (rpError) throw rpError;

        // Process bill type distribution
        const billTypeMap = new Map<string, number>();
        resourcePlanning?.forEach(rp => {
          const billTypeName = rp.bill_types?.name || 'Unassigned';
          billTypeMap.set(billTypeName, (billTypeMap.get(billTypeName) || 0) + 1);
        });

        const billTypeDistribution = Array.from(billTypeMap.entries()).map(([name, value]) => ({
          name,
          value,
          percentage: totalResources > 0 ? (value / totalResources) * 100 : 0
        }));

        sbuAnalytics.push({
          id: sbu.id,
          name: sbu.name,
          totalResources,
          billTypeDistribution
        });
      }

      setSbuData(sbuAnalytics);
      
      // Set default selected SBU to the first one with resources
      if (!selectedSbu && sbuAnalytics.length > 0) {
        const sbuWithResources = sbuAnalytics.find(sbu => sbu.totalResources > 0);
        if (sbuWithResources) {
          setSelectedSbu(sbuWithResources.id);
        }
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching SBU analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch SBU analytics. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSbuAnalytics();
  }, []);

  const handleExport = () => {
    // Create CSV content for SBU analytics
    const csvContent = [
      ['SBU', 'Total Resources', 'Bill Type', 'Count', 'Percentage'],
      ...sbuData.flatMap(sbu =>
        sbu.billTypeDistribution.map(bt => [
          sbu.name,
          sbu.totalResources,
          bt.name,
          bt.value,
          `${bt.percentage.toFixed(1)}%`
        ])
      )
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sbu-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'SBU analytics exported successfully.',
    });
  };

  const selectedSbuData = sbuData.find(sbu => sbu.id === selectedSbu);
  const comparisonSbuData = comparisonSbu !== 'none' ? sbuData.find(sbu => sbu.id === comparisonSbu) : undefined;
  const totalResources = sbuData.reduce((sum, sbu) => sum + sbu.totalResources, 0);

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
              <h1 className="text-2xl font-bold">SBU Resource Analytics</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>Compare and analyze resource distribution across Strategic Business Units</span>
                {lastUpdated && (
                  <span>• Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSbuAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold">{totalResources}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active SBUs</p>
                  <p className="text-2xl font-bold">{sbuData.filter(sbu => sbu.totalResources > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  AVG
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Resources/SBU</p>
                  <p className="text-2xl font-bold">
                    {sbuData.length > 0 ? Math.round(totalResources / sbuData.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SBU Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary SBU</label>
            <Select value={selectedSbu} onValueChange={setSelectedSbu}>
              <SelectTrigger>
                <SelectValue placeholder="Select an SBU to analyze" />
              </SelectTrigger>
              <SelectContent>
                {sbuData.map(sbu => (
                  <SelectItem key={sbu.id} value={sbu.id}>
                    {sbu.name} ({sbu.totalResources} resources)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compare with (Optional)</label>
            <Select value={comparisonSbu} onValueChange={setComparisonSbu}>
              <SelectTrigger>
                <SelectValue placeholder="Select an SBU to compare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No comparison</SelectItem>
                {sbuData
                  .filter(sbu => sbu.id !== selectedSbu)
                  .map(sbu => (
                    <SelectItem key={sbu.id} value={sbu.id}>
                      {sbu.name} ({sbu.totalResources} resources)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SBU Dashboard */}
        {selectedSbuData && (
          <SbuDashboard 
            sbuData={selectedSbuData} 
            loading={loading}
          />
        )}

        {/* SBU Comparison */}
        {selectedSbuData && comparisonSbuData && (
          <SbuComparison 
            primarySbu={selectedSbuData}
            comparisonSbu={comparisonSbuData}
            loading={loading}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
