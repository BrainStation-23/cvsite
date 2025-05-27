
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Pencil, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUniversitySettings, UniversityFormData } from '@/hooks/use-university-settings';

const UniversitySettings: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { 
    items, 
    isLoading, 
    addItem, 
    updateItem, 
    removeItem, 
    isAddingItem, 
    isUpdatingItem, 
    isRemovingItem 
  } = useUniversitySettings();

  const addForm = useForm<UniversityFormData>({
    defaultValues: {
      name: '',
      type: 'public',
      acronyms: ''
    }
  });

  const editForm = useForm<UniversityFormData>({
    defaultValues: {
      name: '',
      type: 'public',
      acronyms: ''
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    addForm.reset({
      name: '',
      type: 'public',
      acronyms: ''
    });
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
    editForm.reset({
      name: item.name,
      type: item.type,
      acronyms: item.acronyms || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: UniversityFormData) => {
    if (!editingId) return;
    updateItem(editingId, data);
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      removeItem(id, name);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading universities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Universities</CardTitle>
          {!isAdding && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add University
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Add New University</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleSaveNew)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  rules={{ required: 'University name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter university name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="type"
                    rules={{ required: 'Type is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="acronyms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acronyms (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. MIT, UCLA" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCancelAdd}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddingItem}>
                    {isAddingItem ? "Adding..." : "Add University"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {items && items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Acronyms</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  {editingId === item.id ? (
                    <TableCell colSpan={5}>
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={editForm.control}
                              name="name"
                              rules={{ required: 'University name is required' }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>University Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter university name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={editForm.control}
                              name="type"
                              rules={{ required: 'Type is required' }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="public">Public</SelectItem>
                                      <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={editForm.control}
                              name="acronyms"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Acronyms</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g. MIT, UCLA" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdatingItem}>
                              {isUpdatingItem ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'public' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {item.type === 'public' ? 'Public' : 'Private'}
                        </span>
                      </TableCell>
                      <TableCell>{item.acronyms || '-'}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleStartEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(item.id, item.name)}
                            disabled={isRemovingItem}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No universities found. Click "Add University" to add the first one.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversitySettings;
