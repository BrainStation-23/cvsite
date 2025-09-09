import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Download, Filter, RotateCcw, ChevronRight, ChevronDown, ArrowRight, FileText, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useResourceChanges } from '@/hooks/use-resource-changes';
import { BillTypeMultiSelect } from './BillTypeMultiSelect';
import { SbuMultiSelect } from './SbuMultiSelect';
import { ProfileMultiSelect } from './ProfileMultiSelect';
import Papa from 'papaparse';

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

  // State for managing expanded collapsible sections
  const [expandedBillTypeChanges, setExpandedBillTypeChanges] = useState<Set<string>>(new Set());
  const [expandedSbuChanges, setExpandedSbuChanges] = useState<Set<string>>(new Set());

  // Process bill type changes into grouped data for collapsible sections
  const processBillTypeChanges = () => {
    if (!billTypeChanges || billTypeChanges.length === 0) {
      return new Map<string, { count: number; changes: typeof billTypeChanges }>();
    }

    const grouped = new Map<string, { count: number; changes: typeof billTypeChanges }>();
    billTypeChanges.forEach(change => {
      const key = `${change.old_bill_type_name} → ${change.new_bill_type_name}`;
      if (!grouped.has(key)) {
        grouped.set(key, { count: 0, changes: [] });
      }
      const group = grouped.get(key)!;
      group.count++;
      group.changes.push(change);
    });

    return grouped;
  };

  // Process SBU changes into grouped data for collapsible sections
  const processSbuChanges = () => {
    if (!sbuChanges || sbuChanges.length === 0) {
      return new Map<string, { count: number; changes: typeof sbuChanges }>();
    }

    const grouped = new Map<string, { count: number; changes: typeof sbuChanges }>();
    sbuChanges.forEach(change => {
      const key = `${change.old_sbu_name ? change.old_sbu_name : 'Not Assigned' } → ${change.new_sbu_name}`;
      if (!grouped.has(key)) {
        grouped.set(key, { count: 0, changes: [] });
      }
      const group = grouped.get(key)!;
      group.count++;
      group.changes.push(change);
    });

    return grouped;
  };

  // Toggle functions for collapsible sections
  const toggleBillTypeChange = (pattern: string) => {
    setExpandedBillTypeChanges(prev => {
      const next = new Set(prev);
      if (next.has(pattern)) {
        next.delete(pattern);
      } else {
        next.add(pattern);
      }
      return next;
    });
  };

  const toggleSbuChange = (pattern: string) => {
    setExpandedSbuChanges(prev => {
      const next = new Set(prev);
      if (next.has(pattern)) {
        next.delete(pattern);
      } else {
        next.add(pattern);
      }
      return next;
    });
  };

  const exportBillTypeChangesToCsv = () => {
    if (!billTypeChanges || billTypeChanges.length === 0) {
      return;
    }

    const csvData = billTypeChanges.map(change => ({
      'Date': format(new Date(change.changed_at), 'yyyy-MM-dd HH:mm:ss'),
      'Employee Name': `${change.first_name} ${change.last_name}`,
      'Employee ID': change.employee_id,
      'Email': change.email,
      'SBU': change.sbu_name,
      'Expertise': change.expertise_name,
      'Manager': change.manager_name,
      'Date of Joining': change.date_of_joining ? format(new Date(change.date_of_joining), 'yyyy-MM-dd') : '',
      'Career Start Date': change.career_start_date ? format(new Date(change.career_start_date), 'yyyy-MM-dd') : '',
      'Project': change.project_name,
      'Old Bill Type': change.old_bill_type_name,
      'New Bill Type': change.new_bill_type_name,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-type-changes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportSbuChangesToCsv = () => {
    if (!sbuChanges || sbuChanges.length === 0) {
      return;
    }

    const csvData = sbuChanges.map(change => ({
      'Date': format(new Date(change.changed_at), 'yyyy-MM-dd HH:mm:ss'),
      'Employee Name': `${change.first_name} ${change.last_name}`,
      'Employee ID': change.employee_id,
      'Old SBU': change.old_sbu_name,
      'New SBU': change.new_sbu_name,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sbu-changes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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

  const billTypeGrouped = processBillTypeChanges();
  const sbuGrouped = processSbuChanges();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

            {/* Profiles Filter */}
            <div className="space-y-2">
              <Label>Profiles</Label>
              <ProfileMultiSelect
                selectedValues={filters.selectedProfiles}
                onSelectionChange={(values) => updateFilters({ selectedProfiles: values })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Bill Type Changes Section */}
        <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-200 border border-muted/50">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Bill Type Changes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {billTypeChangesLoading ? '...' : `${billTypeChanges?.length || 0} changes found`}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportBillTypeChangesToCsv}
                disabled={!billTypeChanges || billTypeChanges.length === 0 || billTypeChangesLoading}
                className="border-muted-foreground/30 hover:bg-muted/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {billTypeChangesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                <span className="text-muted-foreground">Loading bill type changes...</span>
              </div>
            ) : billTypeGrouped.size === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bill type changes found
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(billTypeGrouped.entries())
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([pattern, { count, changes }]) => (
                    <Collapsible 
                      key={pattern}
                      open={expandedBillTypeChanges.has(pattern)}
                      onOpenChange={() => toggleBillTypeChange(pattern)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {expandedBillTypeChanges.has(pattern) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-left">{pattern}</span>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {count} change{count !== 1 ? 's' : ''}
                          </Badge>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="border rounded-lg bg-muted/20">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>SBU</TableHead>
                                <TableHead>Expertise</TableHead>
                                <TableHead>Manager</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Change</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {changes.map((change) => (
                                <TableRow key={change.id}>
                                  <TableCell className="text-sm">
                                    {format(new Date(change.changed_at), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{`${change.first_name} ${change.last_name}`}</span>
                                      <span className="text-xs text-muted-foreground">{change.employee_id}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {change.sbu_name && (
                                      <Badge variant="outline" className="text-xs">
                                        {change.sbu_name}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {change.expertise_name && (
                                      <Badge variant="secondary" className="text-xs">
                                        {change.expertise_name}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {change.manager_name && (
                                      <div className="flex flex-col">
                                        <span className="text-xs">{change.manager_name}</span>
                                        <span className="text-xs text-muted-foreground">{change.manager_employee_id}</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">{change.project_name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Badge variant="outline">{change.old_bill_type_name}</Badge>
                                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                      <Badge variant="default">{change.new_bill_type_name}</Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SBU Changes Section */}
        <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-200 border border-muted/50">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    SBU Changes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {sbuChangesLoading ? '...' : `${sbuChanges?.length || 0} changes found`}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportSbuChangesToCsv}
                disabled={!sbuChanges || sbuChanges.length === 0 || sbuChangesLoading}
                className="border-muted-foreground/30 hover:bg-muted/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sbuChangesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                <span className="text-muted-foreground">Loading SBU changes...</span>
              </div>
            ) : sbuGrouped.size === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No SBU changes found
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(sbuGrouped.entries())
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([pattern, { count, changes }]) => (
                    <Collapsible 
                      key={pattern}
                      open={expandedSbuChanges.has(pattern)}
                      onOpenChange={() => toggleSbuChange(pattern)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {expandedSbuChanges.has(pattern) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-left">{pattern}</span>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {count} change{count !== 1 ? 's' : ''}
                          </Badge>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="border rounded-lg bg-muted/20">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Change</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {changes.map((change) => (
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
                                      <Badge variant="outline">{change.old_sbu_name ? change.old_sbu_name : 'Not Assigned'}</Badge>
                                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                      <Badge variant="default">{change.new_sbu_name}</Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
