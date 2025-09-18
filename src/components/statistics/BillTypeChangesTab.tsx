import React, { useState } from 'react';
import { format } from 'date-fns';
import { useBillTypeChanges } from '@/hooks/use-bill-type-changes';
import Papa from 'papaparse';
import ResourceBillTypeChangesSection from './ResourceBillTypeChangesSection';
import { BillTypeChangesFiltersSection } from './BillTypeChangesFiltersSection';

export const BillTypeChangesTab: React.FC = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    billTypeChanges,
    billTypeChangesLoading,
    isLoading,
  } = useBillTypeChanges();

  // State for managing expanded collapsible sections
  const [expandedBillTypeChanges, setExpandedBillTypeChanges] = useState<Set<string>>(new Set());

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

  if (isLoading && !billTypeChanges) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bill type changes...</p>
        </div>
      </div>
    );
  }

  const billTypeGrouped = processBillTypeChanges();

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <BillTypeChangesFiltersSection
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
      />
      
      {/* Bill Type Changes Section */}
      <ResourceBillTypeChangesSection
        billTypeChanges={billTypeChanges}
        billTypeChangesLoading={billTypeChangesLoading}
        expandedBillTypeChanges={expandedBillTypeChanges}
        toggleBillTypeChange={toggleBillTypeChange}
        exportBillTypeChangesToCsv={exportBillTypeChangesToCsv}
        billTypeGrouped={billTypeGrouped}
      />
    </div>
  );
};