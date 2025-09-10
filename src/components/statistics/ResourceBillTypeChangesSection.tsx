import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download, Filter, RotateCcw, ChevronRight, ChevronDown, ArrowRight, FileText, Users } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const ResourceBillTypeChangesSection =({
    billTypeChanges,
    billTypeChangesLoading,
    exportBillTypeChangesToCsv,
    billTypeGrouped,
    expandedBillTypeChanges,
    toggleBillTypeChange,
}) => (
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
  );
export default ResourceBillTypeChangesSection;
