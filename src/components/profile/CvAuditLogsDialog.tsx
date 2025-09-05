import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, User, Calendar, FileText, Eye } from 'lucide-react';
import { useCvAuditLogs, formatTableName, formatFieldName, getOperationColor, getOperationLabel } from '@/hooks/use-cv-audit-logs';
import { Skeleton } from '@/components/ui/skeleton';

interface CvAuditLogsDialogProps {
  profileId: string;
  trigger?: React.ReactNode;
}

interface FieldChangeDisplayProps {
  fieldName: string;
  oldValue: any;
  newValue: any;
}

const FieldChangeDisplay: React.FC<FieldChangeDisplayProps> = ({ fieldName, oldValue, newValue }) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
      <h5 className="font-medium text-sm">{formatFieldName(fieldName)}</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Previous Value</p>
          <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200">
            {formatValue(oldValue)}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">New Value</p>
          <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-200">
            {formatValue(newValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

const LOGS_PER_PAGE = 15;

const CvAuditLogsDialog: React.FC<CvAuditLogsDialogProps> = ({
  profileId,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { auditLogs, isLoading, error } = useCvAuditLogs(profileId, isOpen);
  const [visibleCount, setVisibleCount] = useState(LOGS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Reset visible logs when dialog opens or logs change
  React.useEffect(() => {
    setVisibleCount(LOGS_PER_PAGE);
    setLoadingMore(false);
  }, [isOpen, auditLogs.length]);

  // Attach scroll handler to the actual scrollable viewport inside ScrollArea
  React.useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    // Find the scrollable viewport inside ScrollArea
    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (
          viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 20
        ) {
          if (visibleCount < auditLogs.length && !loadingMore) {
            setLoadingMore(true);
            setTimeout(() => {
              setVisibleCount((prev) =>
                Math.min(prev + LOGS_PER_PAGE, auditLogs.length)
              );
              setLoadingMore(false);
            }, 500); // Simulate loading delay
          }
        }
        ticking = false;
      });
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => {
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, [auditLogs.length, visibleCount, loadingMore]);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className='h-10'>
      <ClipboardList className="h-4 w-4" />
    </Button>
  );

  const renderAuditLogItem = (log: any, index: number) => {
    const hasChangedFields = log.changed_fields && log.changed_fields.length > 0;
    
    return (
      <Card key={log.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                {formatTableName(log.table_name)}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className={getOperationColor(log.operation_type)}>
                  {getOperationLabel(log.operation_type)}
                </Badge>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {log.changed_by_name || 'System'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(log.changed_at), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {log.operation_type === 'UPDATE' && hasChangedFields && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Changes Made ({log.changed_fields.length} field{log.changed_fields.length !== 1 ? 's' : ''})
              </div>
              
              <div className="space-y-3">
                {log.changed_fields.map((fieldName: string) => (
                  <FieldChangeDisplay
                    key={fieldName}
                    fieldName={fieldName}
                    oldValue={log.old_data?.[fieldName]}
                    newValue={log.new_data?.[fieldName]}
                  />
                ))}
              </div>
            </div>
          )}

          {log.operation_type === 'INSERT' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                <FileText className="h-4 w-4" />
                New Record Created
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-sm">
                A new {formatTableName(log.table_name).toLowerCase()} record was added to the profile.
              </div>
            </div>
          )}

          {log.operation_type === 'DELETE' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                <FileText className="h-4 w-4" />
                Record Deleted
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm">
                A {formatTableName(log.table_name).toLowerCase()} record was removed from the profile.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            CV Data Audit Log
          </DialogTitle>
          <DialogDescription>
            Complete history of changes made to this employee's CV data
          </DialogDescription>
        </DialogHeader>

        <ScrollArea
          className="max-h-[60vh] pr-4"
          ref={scrollAreaRef}
        >
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-2">
                Failed to load audit logs
              </div>
              <p className="text-sm text-muted-foreground">
                There was an error loading the audit history for this profile.
              </p>
            </div>
          )}

          {!isLoading && !error && auditLogs.length === 0 && (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-medium mb-2">No audit logs found</div>
              <p className="text-sm text-muted-foreground">
                No changes have been recorded for this profile's CV data yet.
              </p>
            </div>
          )}

          {!isLoading && !error && auditLogs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {auditLogs.length} audit log{auditLogs.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {auditLogs.slice(0, visibleCount).map((log, index) =>
                  renderAuditLogItem(log, index)
                )}
                {visibleCount < auditLogs.length && (
                  <div className="text-center py-4 text-muted-foreground text-xs flex flex-col items-center">
                    {loadingMore ? (
                      <div className="flex flex-col gap-2 w-full">
                        <Skeleton className="h-4 w-1/3 mx-auto" />
                        <Skeleton className="h-3 w-1/2 mx-auto" />
                        <Skeleton className="h-6 w-2/3 mx-auto" />
                      </div>
                    ) : (
                      <>Scroll to load more...</>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CvAuditLogsDialog;