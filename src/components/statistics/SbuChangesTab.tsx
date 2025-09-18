import React, { useState } from 'react';
import { format } from 'date-fns';
import { useSbuChanges } from '@/hooks/use-sbu-changes';
import Papa from 'papaparse';
import ResourceSbuChangesSection from './ResourceSbuChangesSection';
import { SbuChangesFiltersSection } from './SbuChangesFiltersSection';

export const SbuChangesTab: React.FC = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    sbuChanges,
    sbuChangesLoading,
    isLoading,
  } = useSbuChanges();

  // State for managing expanded collapsible sections
  const [expandedSbuChanges, setExpandedSbuChanges] = useState<Set<string>>(new Set());

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

  if (isLoading && !sbuChanges) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SBU changes...</p>
        </div>
      </div>
    );
  }

  const sbuGrouped = processSbuChanges();

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <SbuChangesFiltersSection
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
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
  );
};