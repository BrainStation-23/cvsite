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
import { BillTypeMultiSelect } from './BillTypeMultiSelect';
import { SbuMultiSelect } from './SbuMultiSelect';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';

const ResourceSbuChangesSection =({
    sbuChanges,
    sbuChangesLoading,
    exportSbuChangesToCsv,
    sbuGrouped,
    expandedSbuChanges,
    toggleSbuChange,
}) => (
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
  );

  export default ResourceSbuChangesSection;
