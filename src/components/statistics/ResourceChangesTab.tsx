
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Download, Filter, RotateCcw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useResourceChanges } from '@/hooks/use-resource-changes';
import { BillTypeMultiSelect } from './BillTypeMultiSelect';
import { SbuMultiSelect } from './SbuMultiSelect';

export const ResourceChangesTab: React.FC = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    summary,
    summaryLoading,
    billTypeChanges,
    billTypeChangesLoading,
    sbuChanges,
    sbuChangesLoading,
    isLoading,
  } = useResourceChanges();

  const exportToCsv = () => {
    const csvData = [];
    
    // Add bill type changes
    billTypeChanges?.forEach(change => {
      csvData.push({
        Type: 'Bill Type Change',
        Date: format(new Date(change.changed_at), 'yyyy-MM-dd HH:mm:ss'),
        Entity: change.project_name,
        'Old Value': change.old_bill_type_name,
        'New Value': change.new_bill_type_name,
      });
    });

    // Add SBU changes
    sbuChanges?.forEach(change => {
      csvData.push({
        Type: 'SBU Change',
        Date: format(new Date(change.changed_at), 'yyyy-MM-dd HH:mm:ss'),
        Entity: `${change.first_name} ${change.last_name} (${change.employee_id})`,
        'Old Value': change.old_sbu_name,
        'New Value': change.new_sbu_name,
      });
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resource-changes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading resource changes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate || undefined}
                    onSelect={(date) => updateFilters({ startDate: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate || undefined}
                    onSelect={(date) => updateFilters({ endDate: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Bill Types Filter */}
            <div className="space-y-2">
              <Label>Bill Types</Label>
              <BillTypeMultiSelect
                selectedValues={filters.selectedBillTypes}
                onSelectionChange={(values) => updateFilters({ selectedBillTypes: values })}
              />
            </div>

            {/* SBUs Filter */}
            <div className="space-y-2">
              <Label>SBUs</Label>
              <SbuMultiSelect
                selectedValues={filters.selectedSbus}
                onSelectionChange={(values) => updateFilters({ selectedSbus: values })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.total_changes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bill Type Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.bill_type_changes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SBU Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.sbu_changes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Changes (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.recent_changes_7d || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Changes Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill Type Changes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Bill Type Changes</CardTitle>
              <Button variant="outline" size="sm" onClick={exportToCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billTypeChangesLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : billTypeChanges?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No bill type changes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    billTypeChanges?.map((change) => (
                      <TableRow key={change.id}>
                        <TableCell className="text-sm">
                          {format(new Date(change.changed_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">{change.project_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{change.old_bill_type_name}</Badge>
                            <span>→</span>
                            <Badge variant="default">{change.new_bill_type_name}</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* SBU Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SBU Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sbuChangesLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : sbuChanges?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No SBU changes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sbuChanges?.map((change) => (
                      <TableRow key={change.id}>
                        <TableCell className="text-sm">
                          {format(new Date(change.changed_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <div className="font-medium">
                              {change.first_name} {change.last_name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {change.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{change.old_sbu_name}</Badge>
                            <span>→</span>
                            <Badge variant="default">{change.new_sbu_name}</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
