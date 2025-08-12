
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Table as TableIcon } from 'lucide-react';
import { ResourceCountStatistics } from '@/hooks/use-resource-count-statistics';
import { ResourceCountTable } from './ResourceCountTable';

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

export const ResourceCountCharts: React.FC<ResourceCountChartsProps> = ({ data, isLoading, filters }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // Determine which cards to show based on active filters
  const showResourceTypeCard = !filters.resourceType;
  const showBillTypeCard = !filters.billType;
  const showExpertiseCard = !filters.expertiseType;
  const showSbuCard = !filters.sbu;

  if (isLoading) {
    // Count how many cards should be shown for loading state
    const cardsToShow = [showResourceTypeCard, showBillTypeCard, showExpertiseCard, showSbuCard].filter(Boolean).length;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: cardsToShow }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{data.total_resources}</div>
            <p className="text-sm text-muted-foreground">Total Resources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{data.active_engagements}</div>
            <p className="text-sm text-muted-foreground">Active Engagements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{data.completed_engagements}</div>
            <p className="text-sm text-muted-foreground">Completed Engagements</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8"
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Table View
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('chart')}
            className="h-8"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Chart View
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {viewMode === 'table' ? (
          // Table Views
          <>
            {showResourceTypeCard && (
              <ResourceCountTable
                title="Resources by Type"
                data={data.by_resource_type || []}
                isLoading={isLoading}
              />
            )}
            {showBillTypeCard && (
              <ResourceCountTable
                title="Resources by Bill Type"
                data={data.by_bill_type || []}
                isLoading={isLoading}
              />
            )}
            {showExpertiseCard && (
              <ResourceCountTable
                title="Resources by Expertise"
                data={data.by_expertise_type || []}
                isLoading={isLoading}
              />
            )}
            {showSbuCard && (
              <ResourceCountTable
                title="Resources by SBU"
                data={data.by_sbu || []}
                isLoading={isLoading}
              />
            )}
          </>
        ) : (
          // Chart Views
          <>
            {/* Resource Types Chart */}
            {showResourceTypeCard && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.by_resource_type || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Bill Types Chart */}
            {showBillTypeCard && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources by Bill Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.by_bill_type || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Expertise Types Chart */}
            {showExpertiseCard && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources by Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.by_expertise_type || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* SBU Chart */}
            {showSbuCard && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources by SBU</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.by_sbu || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
