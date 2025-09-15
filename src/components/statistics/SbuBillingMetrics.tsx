import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSbuBillingMetrics } from '@/hooks/use-sbu-billing-metrics';
import { Loader2, Users, CreditCard } from 'lucide-react';

interface SbuBillingMetricsProps {
  filters?: {
    startDate?: string | null;
    endDate?: string | null;
    sbu?: string | null;
  };
}

export const SbuBillingMetrics: React.FC<SbuBillingMetricsProps> = ({ filters = {} }) => {
  const { data, isLoading, error } = useSbuBillingMetrics(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            SBU Billing Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            SBU Billing Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Error loading billing metrics
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.sbu_metrics?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            SBU Billing Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No billing data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Billable Resources</p>
                <p className="text-2xl font-bold">{data.totals.total_billable_resources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Billed Resources</p>
                <p className="text-2xl font-bold">{data.totals.total_billed_resources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Actual Billed</p>
                <p className="text-2xl font-bold">{data.totals.total_actual_billed.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            SBU Billing Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SBU Name</TableHead>
                <TableHead className="text-right">Billable Resources</TableHead>
                <TableHead className="text-right">Billed Resources</TableHead>
                <TableHead className="text-right">Actual Billed</TableHead>
                <TableHead className="text-right">Utilization %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sbu_metrics.map((metric) => {
                const utilizationRate = metric.billable_resource_count > 0 
                  ? ((metric.billed_resource_count / metric.billable_resource_count) * 100)
                  : 0;
                
                return (
                  <TableRow key={metric.sbu_id}>
                    <TableCell className="font-medium">{metric.sbu_name}</TableCell>
                    <TableCell className="text-right">{metric.billable_resource_count}</TableCell>
                    <TableCell className="text-right">{metric.billed_resource_count}</TableCell>
                    <TableCell className="text-right">{metric.actual_billed.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${
                        utilizationRate >= 80 ? 'text-green-600' :
                        utilizationRate >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {utilizationRate.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};