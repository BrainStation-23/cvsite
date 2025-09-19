import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useJobTypeSettings, JobTypeFormData, JobTypeItem } from '@/hooks/use-job-type-settings';
import JobTypeCSVManager from './job-type/JobTypeCSVManager';

const JobTypeSettings: React.FC = () => {
  const [newJobType, setNewJobType] = useState<JobTypeFormData>({
    name: '',
    color_code: '#3B82F6'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<JobTypeFormData>({
    name: '',
    color_code: '#3B82F6'
  });

  const {
    items,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    bulkImport,
    isAddingItem,
    isUpdatingItem,
    isRemovingItem,
    isBulkImporting
  } = useJobTypeSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobType.name.trim()) return;
    
    addItem(newJobType);
    setNewJobType({
      name: '',
      color_code: '#3B82F6'
    });
  };

  const handleEdit = (id: string, jobType: JobTypeItem) => {
    setEditingId(id);
    setEditItem({
      name: jobType.name,
      color_code: jobType.color_code || '#3B82F6'
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateItem(editingId, editItem);
      setEditingId(null);
      setEditItem({
        name: '',
        color_code: '#3B82F6'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({
      name: '',
      color_code: '#3B82F6'
    });
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
          <CardTitle>Add New Job Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={newJobType.name}
                  onChange={(e) => setNewJobType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter job type name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color_code">Color Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="color_code"
                    type="color"
                    value={newJobType.color_code || '#3B82F6'}
                    onChange={(e) => setNewJobType(prev => ({ ...prev, color_code: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={newJobType.color_code || '#3B82F6'}
                    onChange={(e) => setNewJobType(prev => ({ ...prev, color_code: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isAddingItem || !newJobType.name.trim()}>
              {isAddingItem ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Job Type
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Job Types</CardTitle>
          <JobTypeCSVManager
            jobTypes={items || []}
            onValidationResult={handleValidationResult}
            isBulkImporting={isBulkImporting}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((jobType) => (
                  <TableRow key={jobType.id}>
                    <TableCell>
                      {editingId === jobType.id ? (
                        <Input
                          value={editItem.name}
                          onChange={(e) => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full"
                        />
                      ) : (
                        jobType.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === jobType.id ? (
                        <div className="flex gap-2 align-center">
                          <Input
                            type="color"
                            value={editItem.color_code || '#3B82F6'}
                            onChange={(e) => setEditItem(prev => ({ ...prev, color_code: e.target.value }))}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={editItem.color_code || '#3B82F6'}
                            onChange={(e) => setEditItem(prev => ({ ...prev, color_code: e.target.value }))}
                            className="w-20 text-xs"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: jobType.color_code || '#3B82F6' }}
                          />
                          <span className="text-xs font-mono">{jobType.color_code}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === jobType.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveEdit}
                            disabled={isUpdatingItem}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(jobType.id, jobType)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(jobType.id, jobType.name)}
                            disabled={isRemovingItem}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobTypeSettings;