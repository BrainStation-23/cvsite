
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ReferenceAddForm from './ReferenceAddForm';
import ReferenceTable from './ReferenceTable';
import ReferenceSearchFilters from './ReferenceSearchFilters';
import ReferencePagination from './ReferencePagination';
import ReferenceCSVManager from './ReferenceCSVManager';
import ReferenceCSVValidation from './ReferenceCSVValidation';
import { useReferenceSettings, ReferenceFormData, ReferenceItem } from '@/hooks/settings/use-reference-settings';
import { useReferenceSearch } from '@/hooks/search/use-reference-search';

type SortColumn = 'name' | 'email' | 'designation' | 'company' | 'created_at';
type SortOrder = 'asc' | 'desc';

const ReferenceSettings: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState({
    name: '',
    email: '',
    designation: '',
    company: ''
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
  } = useReferenceSettings();

  const { data: searchData, isLoading: isSearchLoading } = useReferenceSearch({
    searchQuery,
    page: currentPage,
    perPage: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const isLoading = isSettingsLoading || isSearchLoading;
  const references = searchData?.references || [];
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

  const handleValidationResult = (result: any) => {
    if (result.valid && result.valid.length > 0) {
      bulkImport(result.valid);
    }
  };

  const handleEdit = (id: string, reference: ReferenceItem) => {
    setEditingId(id);
    setEditItem({ 
      name: reference.name, 
      email: reference.email || '', 
      designation: reference.designation || '', 
      company: reference.company || '' 
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editItem.name.trim()) {
      updateItem(editingId, editItem);
      setEditingId(null);
      setEditItem({ name: '', email: '', designation: '', company: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({ name: '', email: '', designation: '', company: '' });
  };

  const handleEditItemChange = (field: string, value: string) => {
    setEditItem({ ...editItem, [field]: value });
  };

  const handleDelete = (id: string, name: string) => {
    removeItem(id, name);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferenceAddForm 
            onSubmit={addItem}
            isLoading={isAddingItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage References</CardTitle>
          <ReferenceCSVManager
            references={items || []}
            onValidationResult={handleValidationResult}
            isBulkImporting={isBulkImporting}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <ReferenceSearchFilters
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
            <div className="text-center py-8">Loading references...</div>
          ) : (
            <>
              <ReferenceTable
                references={references}
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
                <ReferencePagination
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

export default ReferenceSettings;
