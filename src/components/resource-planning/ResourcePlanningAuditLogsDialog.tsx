import React, { useState, useRef, useEffect } from 'react';
import { useResourcePlanningAuditLogs, ResourcePlanningAuditLogsParams, ResourcePlanningAuditLog } from '@/hooks/use-resourse-planning-audit-logs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOGS_PER_PAGE = 15;

interface ResourcePlanningAuditLogsDialogProps {
  params: ResourcePlanningAuditLogsParams;
  trigger?: React.ReactNode;
}

const FieldChangeDisplay: React.FC<{ fieldName: string; oldValue: any; newValue: any }> = ({ fieldName, oldValue, newValue }) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
      <h5 className="font-medium text-sm">{fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-semibold">Old:</span> {formatValue(oldValue)}
        </div>
        <div>
          <span className="font-semibold">New:</span> {formatValue(newValue)}
        </div>
      </div>
    </div>
  );
};

export const ResourcePlanningAuditLogsDialog: React.FC<ResourcePlanningAuditLogsDialogProps> = ({
  params,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { auditLogs, isLoading, error } = useResourcePlanningAuditLogs(params, isOpen);
  const [visibleCount, setVisibleCount] = useState(LOGS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Reset visible logs when dialog opens or logs change
  useEffect(() => {
    setVisibleCount(LOGS_PER_PAGE);
    setLoadingMore(false);
  }, [isOpen, auditLogs.length]);

  // Infinite scroll logic
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
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
    <Button variant="outline" size="sm" className='h-9'>
      <ClipboardList className="h-4 w-4" />
    </Button>
  );

  const renderAuditLogItem = (log: ResourcePlanningAuditLog, index: number) => {
    const hasChangedFields = log.changed_fields && log.changed_fields.length > 0;
    return (
      <div key={log.id} className="border rounded-lg p-4 bg-background">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {log.operation_type} by {log.changed_by_user?.first_name} {log.changed_by_user?.last_name} ({log.changed_by_user?.employee_id})
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(log.changed_at).toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Resource Planning ID: {log.resource_planning_id}
          </span>
        </div>
        <Separator />
        {hasChangedFields ? (
          <div className="mt-3 space-y-2">
            {log.changed_fields!.map((field) => (
              <FieldChangeDisplay
                key={field}
                fieldName={field}
                oldValue={log.old_data_enriched?.raw_data?.[field]}
                newValue={log.new_data_enriched?.raw_data?.[field]}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-muted-foreground">
            No field-level changes detected.
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Resource Planning Audit Logs</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4" ref={scrollAreaRef}>
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 bg-background">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-2">
                Failed to load audit logs
              </div>
              <p className="text-sm text-muted-foreground">
                There was an error loading the audit history for resource planning.
              </p>
            </div>
          )}

          {!isLoading && !error && auditLogs.length === 0 && (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-medium mb-2">No audit logs found</div>
              <p className="text-sm text-muted-foreground">
                No changes have been recorded for resource planning yet.
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
                {auditLogs.slice(0, visibleCount).map(renderAuditLogItem)}
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

export default ResourcePlanningAuditLogsDialog;