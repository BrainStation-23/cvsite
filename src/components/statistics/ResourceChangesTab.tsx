import React, { useState } from 'react';
import { format } from 'date-fns';
import { useResourceChanges } from '@/hooks/use-resource-changes';
import Papa from 'papaparse';
import ResourceSbuChangesSection from './ResourceSbuChangesSection';
import ResourceBillTypeChangesSection from './ResourceBillTypeChangesSection';
import ResourceChangesFiltersSection from './ResourceChangesFiltersSection';

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
      <ResourceChangesFiltersSection
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
      />
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Bill Type Changes Section */}
        <ResourceBillTypeChangesSection
          billTypeChanges={billTypeChanges}
          billTypeChangesLoading={billTypeChangesLoading}
          expandedBillTypeChanges={expandedBillTypeChanges}
          toggleBillTypeChange={toggleBillTypeChange}
          exportBillTypeChangesToCsv={exportBillTypeChangesToCsv}
          billTypeGrouped={billTypeGrouped}
        />

        {/* SBU Changes Section */}
        <ResourceSbuChangesSection 
          sbuChanges={sbuChanges}
          sbuChangesLoading={sbuChangesLoading}
          toggleSbuChange={toggleSbuChange}
          expandedSbuChanges={expandedSbuChanges}
          sbuGrouped={sbuGrouped}
          exportSbuChangesToCsv={exportSbuChangesToCsv}
        />
      </div>
    </div>
  );
};
