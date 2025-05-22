
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Pencil, X, CalendarIcon, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Training } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface TrainingTabProps {
  trainings: Training[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (training: Omit<Training, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, training: Partial<Training>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({
  trainings,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const addForm = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: '',
      provider: '',
      description: '',
      date: new Date(),
      certificateUrl: ''
    }
  });

  const editForm = useForm<Omit<Training, 'id'>>({
    defaultValues: {
      title: '',
      provider: '',
      description: '',
      date: new Date(),
      certificateUrl: ''
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    setDate(new Date());
    addForm.reset({
      title: '',
      provider: '',
      description: '',
      date: new Date(),
      certificateUrl: ''
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Training, 'id'>) => {
    data.date = date || new Date();
    
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (training: Training) => {
    setEditingId(training.id);
    setDate(training.date);
    
    editForm.reset({
      title: training.title,
      provider: training.provider,
      description: training.description || '',
      date: training.date,
      certificateUrl: training.certificateUrl || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Training, 'id'>) => {
    if (!editingId) return;
    
    data.date = date || new Date();
    
    const success = await onUpdate(editingId, data);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      await onDelete(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Training & Certifications</CardTitle>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Training
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Training/Certification</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleSaveNew)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="title"
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. AWS Certified Solutions Architect" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="provider"
                  rules={{ required: 'Provider is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Amazon Web Services" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
                
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Brief description of the certification or training" 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="certificateUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCancelAdd}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Training"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {trainings.length > 0 ? (
          <div className="space-y-4">
            {trainings.map((training) => (
              <div key={training.id} className="border rounded-md p-4">
                {editingId === training.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Edit Training</h3>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="title"
                          rules={{ required: 'Title is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certification Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. AWS Certified Solutions Architect" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name="provider"
                          rules={{ required: 'Provider is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. Amazon Web Services" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                        
                        <FormField
                          control={editForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Brief description of the certification or training" 
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name="certificateUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." type="url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{training.title}</h3>
                        <div className="text-sm text-muted-foreground">{training.provider}</div>
                        <div className="text-sm text-muted-foreground mt-1">{format(training.date, 'PPP')}</div>
                      </div>
                      {training.certificateUrl && (
                        <a 
                          href={training.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cvsite-teal flex items-center text-sm hover:underline"
                        >
                          View Certificate <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                    
                    {training.description && (
                      <p className="text-sm text-muted-foreground mt-3">{training.description}</p>
                    )}
                    
                    {isEditing && (
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStartEdit(training)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(training.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No training or certifications added yet. 
            {isEditing && ' Click "Add Training" to add your certifications.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
