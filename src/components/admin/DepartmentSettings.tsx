
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Download, Upload, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartmentSettings, DepartmentFormData } from '@/hooks/use-department-settings';
import { useDepartmentSearch } from '@/hooks/use-department-search';
import { useToast } from '@/hooks/use-toast';
import { exportDepartmentsToCSV, parseDepartmentsCSV, validateDepartmentCSVData, downloadDepartmentCSVTemplate } from '@/utils/departmentCsvUtils';
import UniversityPagination from './university/UniversityPagination';

type SortColumn = 'name' | 'full_form' | 'created_at';
type SortOrder = 'asc' | 'desc';

const DepartmentSettings: React.FC = () => {
  const { toast } = useToast();
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
  const [newItem, setNewItem] = useState({ name: '', full_form: '' });
  const [editItem, setEditItem] = useState({ name: '', full_form: '' });

  // CSV state
  const [validationResult, setValidationResult] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleAdd = () => {
    if (newItem.name.trim()) {
      addItem({ name: newItem.name.trim(), full_form: newItem.full_form.trim() || undefined });
      setNewItem({ name: '', full_form: '' });
      setIsAdding(false);
    }
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

  const handleExport = () => {
    try {
      exportDepartmentsToCSV(departments);
      toast({
        title: "Export successful",
        description: "Departments have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export departments to CSV.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseDepartmentsCSV(file);
      
      if (parsedData.length === 0) {
        toast({
          title: "Import failed",
          description: "No valid data found in CSV file.",
          variant: "destructive"
        });
        return;
      }

      // Validate the data
      const validation = validateDepartmentCSVData(parsedData, departments);
      setValidationResult(validation);

      if (validation.errors.length === 0) {
        toast({
          title: "Validation successful",
          description: `${validation.valid.length} departments ready to import.`,
        });
      } else {
        toast({
          title: "Validation completed",
          description: `Found ${validation.errors.length} errors and ${validation.valid.length} valid entries.`,
          variant: validation.valid.length > 0 ? "default" : "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive"
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <Button variant="outline" onClick={handleExport} disabled={departments.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={downloadDepartmentCSVTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isBulkImporting}>
              <Upload className="mr-2 h-4 w-4" />
              {isBulkImporting ? "Importing..." : "Import CSV"}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
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
        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name or full form..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      if (searchQuery) {
                        setSearchQuery(null);
                        setPage(1);
                      }
                    }}
                    className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              Search
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">
                Sort By
              </label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="full_form-asc">Full Form (A-Z)</SelectItem>
                  <SelectItem value="full_form-desc">Full Form (Z-A)</SelectItem>
                  <SelectItem value="created_at-desc">Created Date (Newest)</SelectItem>
                  <SelectItem value="created_at-asc">Created Date (Oldest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full"
                disabled={!searchQuery && sortBy === 'name' && sortOrder === 'asc'}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name">Name *</Label>
                <Input
                  id="new-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Department name"
                />
              </div>
              <div>
                <Label htmlFor="new-full-form">Full Form</Label>
                <Input
                  id="new-full-form"
                  value={newItem.full_form}
                  onChange={(e) => setNewItem({ ...newItem, full_form: e.target.value })}
                  placeholder="Full department name"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleAdd} 
                disabled={!newItem.name.trim() || isAddingItem}
              >
                {isAddingItem ? 'Adding...' : 'Add Department'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAdding(false);
                setNewItem({ name: '', full_form: '' });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">CSV Validation Results</h3>
              <Button variant="ghost" size="sm" onClick={() => setValidationResult(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {validationResult.valid.length} Valid
                </Badge>
                {validationResult.errors.length > 0 && (
                  <Badge variant="destructive">
                    {validationResult.errors.length} Errors
                  </Badge>
                )}
              </div>
              {validationResult.valid.length > 0 && (
                <Button 
                  onClick={() => handleValidationProceed(validationResult.valid)}
                  disabled={isBulkImporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isBulkImporting ? "Importing..." : `Import ${validationResult.valid.length} Valid Departments`}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Departments Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Full Form</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      value={editItem.full_form}
                      onChange={(e) => setEditItem({ ...editItem, full_form: e.target.value })}
                      className="w-full"
                      placeholder="Full form"
                    />
                  ) : (
                    <span className="text-gray-600">{item.full_form || '-'}</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {editingId === item.id ? (
                      <>
                        <Button size="sm" onClick={handleSaveEdit} disabled={isUpdatingItem}>
                          {isUpdatingItem ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(item.id, item.name, item.full_form)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteDialog({ isOpen: true, id: item.id, name: item.name })}
                          disabled={isRemovingItem}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {departments.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No departments found.
          </div>
        )}

        {/* Pagination */}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, id: '', name: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  removeItem(deleteDialog.id, deleteDialog.name);
                  setDeleteDialog({ isOpen: false, id: '', name: '' });
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default DepartmentSettings;
