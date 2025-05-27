
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DegreeAddForm from './degree/DegreeAddForm';
import DegreeTable from './degree/DegreeTable';
import DegreeSearchFilters from './degree/DegreeSearchFilters';
import DegreePagination from './degree/DegreePagination';
import DegreeCSVManager from './degree/DegreeCSVManager';
import DegreeCSVValidation from './degree/DegreeCSVValidation';
import { useDegreeSettings } from '@/hooks/use-degree-settings';
import { useDegreeSearch } from '@/hooks/use-degree-search';
import { DegreeFormData } from '@/utils/degreeCsvUtils';

const DegreeSettings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [validationResult, setValidationResult] = useState<any>(null);
  const itemsPerPage = 10;

  const { 
    degrees: allDegrees,
    addDegree, 
    deleteDegree, 
    bulkImportDegrees,
    isAddingDegree,
    isBulkImporting,
    isDeletingDegree 
  } = useDegreeSettings();

  const {
    data: searchData,
    isLoading,
  } = useDegreeSearch({
    searchQuery,
    page: currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
  });

  const degrees = searchData?.degrees || [];
  const pagination = searchData?.pagination;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleValidationResult = (result: any) => {
    setValidationResult(result);
  };

  const handleProceedImport = (validDegrees: DegreeFormData[]) => {
    bulkImportDegrees(validDegrees);
    setValidationResult(null);
  };

  const handleCloseValidation = () => {
    setValidationResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Degree</CardTitle>
        </CardHeader>
        <CardContent>
          <DegreeAddForm 
            onSubmit={addDegree}
            isLoading={isAddingDegree}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Degrees Management</span>
            <DegreeCSVManager 
              degrees={allDegrees}
              onValidationResult={handleValidationResult}
              isBulkImporting={isBulkImporting}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationResult && (
            <DegreeCSVValidation
              validationResult={validationResult}
              onProceed={handleProceedImport}
              onClose={handleCloseValidation}
              isBulkImporting={isBulkImporting}
            />
          )}
          
          <DegreeSearchFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
          />
          
          <Separator />
          
          {isLoading ? (
            <div className="text-center py-8">Loading degrees...</div>
          ) : (
            <>
              <DegreeTable
                degrees={degrees}
                onDelete={deleteDegree}
                isLoading={isDeletingDegree}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              
              {pagination && (
                <div className="flex justify-center">
                  <DegreePagination
                    currentPage={currentPage}
                    totalPages={pagination.page_count}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DegreeSettings;
