
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSbuSearch } from '@/hooks/use-sbu-search';
import SbuAddForm from './sbu/SbuAddForm';
import SbuSearchFilters from './sbu/SbuSearchFilters';
import SbuTable from './sbu/SbuTable';
import SbuPagination from './sbu/SbuPagination';
import SbuCSVManager from './sbu/SbuCSVManager';
import { SbuFormData, SbuItem, useSbuSettings } from '@/hooks/use-sbu-settings';

type SortColumn = 'name' | 'sbu_head_email' | 'created_at';
type SortOrder = 'asc' | 'desc';

const SbuSettings: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<SbuFormData>({
    name: '',
    sbu_head_email: '',
    sbu_head_name: '',
    is_department: false
  });

  const {
    items,
    isLoading: isSettingsLoading,
    addItem,
    updateItem,
    removeItem,
    bulkImport,
    isAddingItem,
    isUpdatingItem,
    isRemovingItem,
    isBulkImporting
  } = useSbuSettings();

  const { data: searchData, isLoading: isSearchLoading } = useSbuSearch({
    searchQuery,
    page: currentPage,
    perPage: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const isLoading = isSettingsLoading || isSearchLoading;
  const sbus = searchData?.sbus || [];
  const pagination = searchData?.pagination;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim() || null);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [SortColumn, SortOrder];
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

  const handleEdit = (id: string, sbu: SbuItem) => {
    setEditingId(id);
    setEditItem({
      name: sbu.name,
      sbu_head_email: sbu.sbu_head_email,
      sbu_head_name: sbu.sbu_head_name,
      is_department: sbu.is_department
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateItem(editingId, editItem);
      setEditingId(null);
      setEditItem({
        name: '',
        sbu_head_email: '',
        sbu_head_name: '',
        is_department: false
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({
      name: '',
      sbu_head_email: '',
      sbu_head_name: '',
      is_department: false
    });
  };

  const handleEditItemChange = (field: keyof SbuFormData, value: string | boolean) => {
    setEditItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = (id: string, name: string) => {
    removeItem(id, name);
  };

  const handleValidationResult = (result: any) => {
    if (result.valid && result.valid.length > 0) {
      bulkImport(result.valid);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New SBU</CardTitle>
        </CardHeader>
        <CardContent>
          <SbuAddForm 
            onSubmit={addItem}
            isLoading={isAddingItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage SBUs</CardTitle>
          <SbuCSVManager
            sbus={items || []}
            onValidationResult={handleValidationResult}
            isBulkImporting={isBulkImporting}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <SbuSearchFilters
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

          {isLoading ? (
            <div className="text-center py-8">Loading SBUs...</div>
          ) : (
            <>
              <SbuTable
                sbus={sbus}
                editingId={editingId}
                editItem={editItem}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditItemChange={handleEditItemChange}
                onDelete={handleDelete}
                isUpdating={isUpdatingItem}
                isRemoving={isRemovingItem}
                isLoading={isLoading}
              />

              {pagination && (
                <SbuPagination
                  pagination={pagination}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SbuSettings;
