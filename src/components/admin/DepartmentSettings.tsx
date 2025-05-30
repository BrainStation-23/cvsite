
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useDepartmentSettings, DepartmentFormData } from '@/hooks/use-department-settings';
import { useDepartmentSearch } from '@/hooks/use-department-search';
import DepartmentAddForm from './department/DepartmentAddForm';
import DepartmentSearchFilters from './department/DepartmentSearchFilters';
import DepartmentTable from './department/DepartmentTable';
import DepartmentCSVManager from './department/DepartmentCSVManager';
import DepartmentCSVValidation from './department/DepartmentCSVValidation';
import DepartmentDeleteDialog from './department/DepartmentDeleteDialog';
import UniversityPagination from './university/UniversityPagination';

type SortColumn = 'name' | 'full_form' | 'created_at';
type SortOrder = 'asc' | 'desc';

const DepartmentSettings: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Form state
  const [editItem, setEditItem] = useState({ name: '', full_form: '' });

  // CSV state
  const [validationResult, setValidationResult] = useState<any>(null);

  const { 
    addItem, 
    updateItem, 
    removeItem, 
    bulkImportItems,
    isAddingItem, 
    isUpdatingItem, 
    isRemovingItem,
    isBulkImporting
  } = useDepartmentSettings();

  // Use the search hook
  const { data: searchResult, isLoading } = useDepartmentSearch({
    searchQuery,
    page,
    perPage,
    sortBy,
    sortOrder
  });

  const departments = searchResult?.departments || [];
  const pagination = searchResult?.pagination;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput || null);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [column, order] = value.split('-') as [SortColumn, SortOrder];
    setSortBy(column);
    setSortOrder(order);
    setPage(1);
  };

  const handleReset = () => {
    setSearchQuery(null);
    setSearchInput('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const handleAdd = (department: { name: string; full_form?: string }) => {
    addItem(department);
    setIsAdding(false);
  };

  const handleEdit = (id: string, name: string, full_form: string | null) => {
    setEditingId(id);
    setEditItem({ name, full_form: full_form || '' });
  };

  const handleSaveEdit = () => {
    if (editingId && editItem.name.trim()) {
      updateItem(editingId, { name: editItem.name.trim(), full_form: editItem.full_form.trim() || undefined });
      setEditingId(null);
      setEditItem({ name: '', full_form: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({ name: '', full_form: '' });
  };

  const handleEditItemChange = (field: 'name' | 'full_form', value: string) => {
    setEditItem({ ...editItem, [field]: value });
  };

  const handleValidationProceed = (validDepartments: DepartmentFormData[]) => {
    bulkImportItems(validDepartments);
    setValidationResult(null);
  };

  if (isLoading && !searchResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading departments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Departments</CardTitle>
          <div className="flex gap-2">
            <DepartmentCSVManager
              departments={departments}
              onValidationResult={setValidationResult}
              isBulkImporting={isBulkImporting}
            />
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DepartmentSearchFilters
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

        {isAdding && (
          <DepartmentAddForm
            onAdd={handleAdd}
            onCancel={() => setIsAdding(false)}
            isAdding={isAddingItem}
          />
        )}

        {validationResult && (
          <DepartmentCSVValidation
            validationResult={validationResult}
            onProceed={handleValidationProceed}
            onClose={() => setValidationResult(null)}
            isBulkImporting={isBulkImporting}
          />
        )}

        <DepartmentTable
          departments={departments}
          editingId={editingId}
          editItem={editItem}
          onEdit={handleEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEditItemChange={handleEditItemChange}
          onDelete={(id, name) => setDeleteDialog({ isOpen: true, id, name })}
          isUpdating={isUpdatingItem}
          isRemoving={isRemovingItem}
          isLoading={isLoading}
        />

        {pagination && (
          <UniversityPagination
            pagination={pagination}
            onPageChange={setPage}
            onPerPageChange={(newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            }}
            isLoading={isLoading}
          />
        )}

        <DepartmentDeleteDialog
          isOpen={deleteDialog.isOpen}
          departmentName={deleteDialog.name}
          onConfirm={() => {
            removeItem(deleteDialog.id, deleteDialog.name);
            setDeleteDialog({ isOpen: false, id: '', name: '' });
          }}
          onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '' })}
        />
      </CardContent>
    </Card>
  );
};

export default DepartmentSettings;
