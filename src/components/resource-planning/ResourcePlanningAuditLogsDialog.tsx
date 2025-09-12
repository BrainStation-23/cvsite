import React, { useState, useRef, useEffect } from 'react';
import { useResourcePlanningAuditLogs, ResourcePlanningAuditLogsParams, ResourcePlanningAuditLog } from '@/hooks/use-resourse-planning-audit-logs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Eye, User, Briefcase, BadgeDollarSign, Percent, CalendarDays, CheckCircle, HelpCircle, FileEdit, Trash2, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BillTypeCombobox from './BillTypeCombobox';
import DatePicker from '../admin/user/DatePicker';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import ProjectSearchCombobox from './ProjectSearchCombobox';


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
  const defaultFilters = {
    searchQuery: '',
    billTypeFilter: null as string | null,
    startDateFrom: null as string | null,
    startDateTo: null as string | null,
    employeeIdFilter: null as string | null,
    operationTypeFilter: null as string | null,
    projectNameFilter: '',
    sortBy: 'changed_at',
    sortOrder: 'desc',
  };

  // Filter state
  const [filters, setFilters] = useState(defaultFilters);

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Update filter helper
  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => setFilters(defaultFilters);

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) =>
      value !== null &&
      value !== '' &&
      // Don't count sortBy/sortOrder as "active"
      key !== 'sortBy' &&
      key !== 'sortOrder'
  );

  // Compose params for the hook
  const auditLogParams: ResourcePlanningAuditLogsParams = {
    bill_type_filter: filters.billTypeFilter,
    date_from: filters.startDateFrom,
    date_to: filters.startDateTo,
    employee_id_filter: filters.employeeIdFilter,
    operation_type_filter: filters.operationTypeFilter,
    project_name_filter: filters.projectNameFilter || null,
    search_query: filters.searchQuery || null,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder as 'asc' | 'desc',
    items_per_page: perPage,
    page_number: page,
  };

  const [isOpen, setIsOpen] = useState(false);
  const { auditLogs, pagination, isLoading, error } = useResourcePlanningAuditLogs(auditLogParams, isOpen);


  const defaultTrigger = (
    <Button variant="outline" size="sm" className='h-9'>
      <ClipboardList className="h-4 w-4" />
    </Button>
  );

  const renderAuditLogItem = (log: ResourcePlanningAuditLog, index: number) => {
    const hasChangedFields = log.changed_fields && log.changed_fields.length > 0;
    const oldProfile = log.old_data_enriched?.profile;
    const newProfile = log.new_data_enriched?.profile;
    const oldProject = log.old_data_enriched?.project;
    const newProject = log.new_data_enriched?.project;
    const oldBillType = log.old_data_enriched?.bill_type;
    const newBillType = log.new_data_enriched?.bill_type;

    const employee =
      newProfile?.first_name
        ? `${newProfile.first_name} ${newProfile.last_name} (${newProfile.employee_id})`
        : oldProfile?.first_name
          ? `${oldProfile.first_name} ${oldProfile.last_name} (${oldProfile.employee_id})`
          : "Unknown";

    const operationColor =
      log.operation_type === 'INSERT'
        ? 'border-green-500'
        : log.operation_type === 'UPDATE'
        ? 'border-blue-500'
        : 'border-red-500';

    const operationIcon =
      log.operation_type === 'INSERT'
        ? <PlusCircle className="h-4 w-4 text-green-600" />
        : log.operation_type === 'UPDATE'
        ? <FileEdit className="h-4 w-4 text-blue-600" />
        : <Trash2 className="h-4 w-4 text-red-600" />;

    return (
      <div
        key={log.id}
        className={`relative rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow border-2 ${operationColor} p-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {operationIcon}
            <span className="font-semibold text-sm capitalize">
              {log.operation_type.toLowerCase()}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              by {log.changed_by_user?.first_name} {log.changed_by_user?.last_name} ({log.changed_by_user?.employee_id})
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {new Date(log.changed_at).toLocaleString()}
          </div>
        </div>
        <Separator />
        {/* Details */}
        <div className="bg-muted/40 rounded-lg px-6 py-4 my-3">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Employee:</dt>
              <dd className="ml-1">
                {employee}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Project:</dt>
              <dd className="ml-1">{newProject?.project_name || <span className="text-muted-foreground">N/A</span>}</dd>
            </div>
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Bill Type:</dt>
              <dd className="ml-1">{newBillType?.name || <span className="text-muted-foreground">N/A</span>}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Engagement %:</dt>
              <dd className="ml-1">{log.new_data_enriched?.engagement_percentage ?? <span className="text-muted-foreground">N/A</span>}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Billing %:</dt>
              <dd className="ml-1">{log.new_data_enriched?.billing_percentage ?? <span className="text-muted-foreground">N/A</span>}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Engagement Start:</dt>
              <dd className="ml-1">{log.new_data_enriched?.engagement_start_date ?? <span className="text-muted-foreground">N/A</span>}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Release Date:</dt>
              <dd className="ml-1">{log.new_data_enriched?.release_date ?? <span className="text-muted-foreground">N/A</span>}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <dt className="font-semibold">Weekly Validation:</dt>
              <dd className="ml-1">{log.new_data_enriched?.weekly_validation ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>
        <Separator />
        {/* Changed Fields */}
        {hasChangedFields ? (
          <div className="mt-3 space-y-2 px-4 pb-4">
            {log.changed_fields!.map((field) => (
              <FieldChangeDisplay
                key={field}
                fieldName={field}
                oldValue={log.old_data_enriched?.raw_data?.[field]}
                newValue={log.new_data_enriched?.raw_data?.[field]}
              />
            ))}
          </div>
        ) : (''
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Resource Planning Audit Logs</DialogTitle>
          <div className='resource-audit-logs-filters grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 w-full'>
            <div className="space-y-2">
              <Label htmlFor="search-query">Search</Label>
              <Input
                id="search-query"
                placeholder="Search employees, projects, etc..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-type-filter">Bill Type</Label>
              <BillTypeCombobox
                value={filters.billTypeFilter}
                onValueChange={(value) => updateFilter('billTypeFilter', value)}
                placeholder="Select bill type..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-filter">Project</Label>
                <ProjectSearchCombobox
                value={filters.projectNameFilter}
                onValueChange={(value) => updateFilter('projectNameFilter', value)}
                placeholder="Select project..."
                />
            </div> 
            <div className="space-y-2">
              <Label htmlFor="operation-type-filter">Operation Type</Label>
              <Select
                value={filters.operationTypeFilter || "all"}
                onValueChange={(value) => updateFilter('operationTypeFilter', value === "all" ? null : value)}
              >
                <SelectTrigger id="operation-type-filter">
                  {filters.operationTypeFilter || 'All'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="INSERT">Insert</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter('sortBy', value)}
              >
                <SelectTrigger id="sort-by">
                  {filters.sortBy}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="changed_at">Changed At</SelectItem>
                  <SelectItem value="created_at">Created At</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => updateFilter('sortOrder', value)}
              >
                <SelectTrigger id="sort-order">
                  {filters.sortOrder}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
              <div className="space-y-2">
              <Label>Start Date Range</Label>
              <div className="flex gap-2">
                <DatePicker
                  value={filters.startDateFrom}
                  onChange={(val) => updateFilter('startDateFrom', val)}
                  placeholder="From date"
                />
                <DatePicker
                  value={filters.startDateTo}
                  onChange={(val) => updateFilter('startDateTo', val)}
                  placeholder="To date"
                />
              </div>
            </div>
           {hasActiveFilters && (
            <div className="flex justify-end pt-7">
              <Button variant="outline" onClick={handleClearAll}>
                Clear Filters
              </Button>
            </div>
          )}
          </div>

        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4">
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

          {!error && auditLogs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {auditLogs.length} of {pagination?.filtered_count ?? 0} audit log{pagination?.filtered_count !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Rows per page:</label>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                  >
                    {[5, 10, 20, 50].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                {auditLogs.map(renderAuditLogItem)}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs">
                  Page {pagination?.page ?? page} of {pagination?.page_count ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (pagination?.page_count ?? 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcePlanningAuditLogsDialog;