
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DesignationAddForm from './designation/DesignationAddForm';
import DesignationTable from './designation/DesignationTable';
import DesignationSearchFilters from './designation/DesignationSearchFilters';
import DesignationPagination from './designation/DesignationPagination';
import DesignationCSVManager from './designation/DesignationCSVManager';
import DesignationCSVValidation from './designation/DesignationCSVValidation';
import { useDesignationSettings } from '@/hooks/use-designation-settings';
import { useDesignationSearch } from '@/hooks/use-designation-search';
import { DesignationFormData } from '@/utils/designationCsvUtils';

const DesignationSettings: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState({ name: '' });
  const itemsPerPage = 10;

  const { 
    designations: allDesignations,
    addDesignation, 
    updateDesignation,
    deleteDesignation, 
    bulkImportDesignations,
    isAddingDesignation,
    isUpdatingDesignation,
    isDeletingDesignation,
    isBulkImporting
  } = useDesignationSettings();

  const {
    data: searchData,
    isLoading,
  } = useDesignationSearch({
    searchQuery,
    page: currentPage,
    perPage: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const designations = searchData?.designations || [];
  const pagination = searchData?.pagination;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim() || null);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchQuery(null);
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditItem({ name });
  };

  const handleSaveEdit = () => {
    if (editingId && editItem.name.trim()) {
      updateDesignation(editingId, editItem.name.trim());
      setEditingId(null);
      setEditItem({ name: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({ name: '' });
  };

  const handleEditItemChange = (field: 'name', value: string) => {
    setEditItem(prev => ({ ...prev, [field]: value }));
  };

  const handleValidationResult = (result: any) => {
    setValidationResult(result);
  };

  const handleProceedImport = (validDesignations: DesignationFormData[]) => {
    bulkImportDesignations(validDesignations);
    setValidationResult(null);
  };

  const handleCloseValidation = () => {
    setValidationResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Designation</CardTitle>
        </CardHeader>
        <CardContent>
          <DesignationAddForm 
            onSubmit={addDesignation}
            isLoading={isAddingDesignation}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Designation Management</span>
            <DesignationCSVManager 
              designations={allDesignations}
              onValidationResult={handleValidationResult}
              isBulkImporting={isBulkImporting}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationResult && (
            <DesignationCSVValidation
              validationResult={validationResult}
              onProceed={handleProceedImport}
              onClose={handleCloseValidation}
              isBulkImporting={isBulkImporting}
            />
          )}
          
          <DesignationSearchFilters
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onReset={handleReset}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
          
          <Separator />
          
          {isLoading ? (
            <div className="text-center py-8">Loading designations...</div>
          ) : (
            <>
              <DesignationTable
                designations={designations}
                editingId={editingId}
                editItem={editItem}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditItemChange={handleEditItemChange}
                onDelete={deleteDesignation}
                isUpdating={isUpdatingDesignation}
                isRemoving={isDeletingDesignation}
                isLoading={isLoading}
              />
              
              {pagination && (
                <div className="flex justify-center">
                  <DesignationPagination
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

export default DesignationSettings;
