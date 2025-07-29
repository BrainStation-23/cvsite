
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ResourcePlanningTableHeader } from './ResourcePlanningTableHeader';
import { WeeklyValidationTableRow } from './WeeklyValidationTableRow';
import { ResourcePlanningPagination } from './ResourcePlanningPagination';

interface WeeklyValidationTabProps {
  searchQuery: string;
  selectedSbu: string | null;
  selectedManager: string | null;
  // Centralized data props
  weeklyValidationData: any;
}

export const WeeklyValidationTab: React.FC<WeeklyValidationTabProps> = ({
  searchQuery,
  selectedSbu,
  selectedManager,
  weeklyValidationData,
}) => {
  const {
    data,
    pagination,
    isLoading,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    validateWeekly,
    isValidating,
  } = weeklyValidationData;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading weekly validation data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No pending weekly validations found. All resource assignments have been validated.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <ResourcePlanningTableHeader 
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableBody>
                {data.map((item: any) => (
                  <WeeklyValidationTableRow 
                    key={item.id} 
                    item={item} 
                    onValidate={validateWeekly}
                    isValidating={isValidating}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && (
            <ResourcePlanningPagination 
              pagination={pagination}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};
