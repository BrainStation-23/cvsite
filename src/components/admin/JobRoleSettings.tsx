import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit2, Save, X, Download, Upload, Loader2 } from 'lucide-react';
import { useJobRoleSettings, JobRoleFormData, JobRoleItem } from '@/hooks/use-job-role-settings';
import JobRoleCSVManager from './job-role/JobRoleCSVManager';

const JobRoleSettings: React.FC = () => {
  const [newJobRole, setNewJobRole] = useState<JobRoleFormData>({
    name: '',
    purpose: '',
    responsibilities: '',
    color_code: '#3B82F6'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<JobRoleFormData>({
    name: '',
    purpose: '',
    responsibilities: '',
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
  } = useJobRoleSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobRole.name.trim()) return;
    
    addItem(newJobRole);
    setNewJobRole({
      name: '',
      purpose: '',
      responsibilities: '',
      color_code: '#3B82F6'
    });
  };

  const handleEdit = (id: string, jobRole: JobRoleItem) => {
    setEditingId(id);
    setEditItem({
      name: jobRole.name,
      purpose: jobRole.purpose || '',
      responsibilities: jobRole.responsibilities || '',
      color_code: jobRole.color_code || '#3B82F6'
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateItem(editingId, editItem);
      setEditingId(null);
      setEditItem({
        name: '',
        purpose: '',
        responsibilities: '',
        color_code: '#3B82F6'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({
      name: '',
      purpose: '',
      responsibilities: '',
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
          <CardTitle>Add New Job Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={newJobRole.name}
                  onChange={(e) => setNewJobRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter job role name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color_code">Color Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="color_code"
                    type="color"
                    value={newJobRole.color_code || '#3B82F6'}
                    onChange={(e) => setNewJobRole(prev => ({ ...prev, color_code: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={newJobRole.color_code || '#3B82F6'}
                    onChange={(e) => setNewJobRole(prev => ({ ...prev, color_code: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={newJobRole.purpose || ''}
                onChange={(e) => setNewJobRole(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Enter job role purpose"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                value={newJobRole.responsibilities || ''}
                onChange={(e) => setNewJobRole(prev => ({ ...prev, responsibilities: e.target.value }))}
                placeholder="Enter job role responsibilities"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isAddingItem || !newJobRole.name.trim()}>
              {isAddingItem ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Job Role
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Job Roles</CardTitle>
          <JobRoleCSVManager
            jobRoles={items || []}
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
                  <TableHead>Purpose</TableHead>
                  <TableHead>Responsibilities</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((jobRole) => (
                  <TableRow key={jobRole.id}>
                    <TableCell>
                      {editingId === jobRole.id ? (
                        <Input
                          value={editItem.name}
                          onChange={(e) => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full"
                        />
                      ) : (
                        jobRole.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === jobRole.id ? (
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
                            style={{ backgroundColor: jobRole.color_code || '#3B82F6' }}
                          />
                          <span className="text-xs font-mono">{jobRole.color_code}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {editingId === jobRole.id ? (
                        <Textarea
                          value={editItem.purpose || ''}
                          onChange={(e) => setEditItem(prev => ({ ...prev, purpose: e.target.value }))}
                          className="w-full"
                          rows={2}
                        />
                      ) : (
                        <div className="truncate" title={jobRole.purpose}>
                          {jobRole.purpose || '-'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {editingId === jobRole.id ? (
                        <Textarea
                          value={editItem.responsibilities || ''}
                          onChange={(e) => setEditItem(prev => ({ ...prev, responsibilities: e.target.value }))}
                          className="w-full"
                          rows={2}
                        />
                      ) : (
                        <div className="truncate" title={jobRole.responsibilities}>
                          {jobRole.responsibilities || '-'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === jobRole.id ? (
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
                            onClick={() => handleEdit(jobRole.id, jobRole)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(jobRole.id, jobRole.name)}
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

export default JobRoleSettings;