
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, CheckCircle, Building } from 'lucide-react';
import { ResourceCountStatistics } from '@/hooks/use-resource-count-statistics';

interface ResourceCountChartsProps {
  data: ResourceCountStatistics;
  isLoading: boolean;
  filters: {
    resourceType?: string | null;
    billType?: string | null;
    expertiseType?: string | null;
    sbu?: string | null;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ResourceCountCharts: React.FC<ResourceCountChartsProps> = ({
  data,
  isLoading,
  filters
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Determine current grouping dimension
  const getCurrentGroupBy = () => {
    if (filters.sbu) return 'sbu';
    if (filters.resourceType) return 'resourceType';
    if (filters.billType) return 'billType';
    if (filters.expertiseType) return 'expertiseType';
    return 'all';
  };

  const currentGroupBy = getCurrentGroupBy();

  // Summary Cards
  const SummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="text-2xl font-bold">{data.total_resources}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Engagements</p>
              <p className="text-2xl font-bold">{data.active_engagements}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{data.completed_engagements}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Chart component for individual breakdowns
  const BreakdownChart = ({ 
    title, 
    data: chartData, 
    icon: Icon 
  }: { 
    title: string; 
    data: Array<{ name: string; count: number }>; 
    icon: React.ComponentType<any>;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // Pie chart component
  const PieBreakdownChart = ({ 
    title, 
    data: chartData, 
    icon: Icon 
  }: { 
    title: string; 
    data: Array<{ name: string; count: number }>; 
    icon: React.ComponentType<any>;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // Render charts based on current grouping
  const renderCharts = () => {
    switch (currentGroupBy) {
      case 'sbu':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakdownChart
              title="Resources by SBU"
              data={data.by_sbu}
              icon={Building}
            />
            <PieBreakdownChart
              title="SBU Distribution"
              data={data.by_sbu}
              icon={Building}
            />
          </div>
        );
      case 'resourceType':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakdownChart
              title="Resources by Type"
              data={data.by_resource_type}
              icon={Users}
            />
            <PieBreakdownChart
              title="Resource Type Distribution"
              data={data.by_resource_type}
              icon={Users}
            />
          </div>
        );
      case 'billType':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakdownChart
              title="Resources by Bill Type"
              data={data.by_bill_type}
              icon={TrendingUp}
            />
            <PieBreakdownChart
              title="Bill Type Distribution"
              data={data.by_bill_type}
              icon={TrendingUp}
            />
          </div>
        );
      case 'expertiseType':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakdownChart
              title="Resources by Expertise"
              data={data.by_expertise_type}
              icon={CheckCircle}
            />
            <PieBreakdownChart
              title="Expertise Distribution"
              data={data.by_expertise_type}
              icon={CheckCircle}
            />
          </div>
        );
      default:
        // Show all dimensions when "All" is selected
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakdownChart
              title="Resources by SBU"
              data={data.by_sbu}
              icon={Building}
            />
            <BreakdownChart
              title="Resources by Type"
              data={data.by_resource_type}
              icon={Users}
            />
            <BreakdownChart
              title="Resources by Bill Type"
              data={data.by_bill_type}
              icon={TrendingUp}
            />
            <BreakdownChart
              title="Resources by Expertise"
              data={data.by_expertise_type}
              icon={CheckCircle}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <SummaryCards />
      {renderCharts()}
    </div>
  );
};
