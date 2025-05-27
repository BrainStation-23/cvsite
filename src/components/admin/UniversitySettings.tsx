
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useUniversitySettings, UniversityFormData } from '@/hooks/use-university-settings';
import { useUniversitySearch } from '@/hooks/use-university-search';
import UniversityAddForm from './university/UniversityAddForm';
import UniversityTable from './university/UniversityTable';
import UniversityDeleteDialog from './university/UniversityDeleteDialog';
import UniversityCSVManager from './university/UniversityCSVManager';
import UniversitySearchFilters, { SortColumn, SortOrder } from './university/UniversitySearchFilters';
import UniversityPagination from './university/UniversityPagination';

const UniversitySettings: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const { 
    addItem, 
    updateItem, 
    removeItem, 
    bulkImportItems,
    isAddingItem, 
    isUpdatingItem, 
    isRemovingItem,
    isBulkImporting
  } = useUniversitySettings();

  // Use the new search hook
  const { data: searchResult, isLoading } = useUniversitySearch({
    searchQuery,
    typeFilter,
    page,
    perPage,
    sortBy,
    sortOrder
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: UniversityFormData) => {
    addItem(data);
    setIsAdding(false);
  };

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string, data: UniversityFormData) => {
    updateItem(id, data);
    setEditingId(null);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, id, name });
  };

  const handleDeleteConfirm = () => {
    removeItem(deleteDialog.id, deleteDialog.name);
    setDeleteDialog({ isOpen: false, id: '', name: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, id: '', name: '' });
  };

  const handleCSVImport = (universities: UniversityFormData[]) => {
    bulkImportItems(universities);
  };

  const handleSearch = (query: string | null) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page
  };

  const handleFilterType = (type: string | null) => {
    setTypeFilter(type);
    setPage(1); // Reset to first page
  };

  const handleSortChange = (column: SortColumn, order: SortOrder) => {
    setSortBy(column);
    setSortOrder(order);
    setPage(1); // Reset to first page
  };

  const handleReset = () => {
    setSearchQuery(null);
    setTypeFilter(null);
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page
  };

  if (isLoading && !searchResult) {
    return (
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Universities</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center py-8">Loading universities...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const universities = searchResult?.universities || [];
  const pagination = searchResult?.pagination;

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>Universities</CardTitle>
            <div className="flex gap-2">
              <UniversityCSVManager 
                universities={universities}
                onImport={handleCSVImport}
                isImporting={isBulkImporting}
              />
              {!isAdding && (
                <Button variant="outline" onClick={handleStartAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add University
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {isAdding && (
            <div className="mb-4 flex-shrink-0">
              <UniversityAddForm
                onSave={handleSaveNew}
                onCancel={handleCancelAdd}
                isAdding={isAddingItem}
              />
            </div>
          )}
          
          <div className="flex-shrink-0 mb-4">
            <UniversitySearchFilters
              onSearch={handleSearch}
              onFilterType={handleFilterType}
              onSortChange={handleSortChange}
              onReset={handleReset}
              searchQuery={searchQuery}
              currentType={typeFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              isLoading={isLoading}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <UniversityTable
              items={universities}
              editingId={editingId}
              onEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDeleteClick}
              isUpdating={isUpdatingItem}
              isRemoving={isRemovingItem}
            />
          </div>

          {pagination && (
            <div className="flex-shrink-0 mt-4">
              <UniversityPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                isLoading={isLoading}
              />
            </div>
          )}
          
          <UniversityDeleteDialog
            isOpen={deleteDialog.isOpen}
            universityName={deleteDialog.name}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversitySettings;
