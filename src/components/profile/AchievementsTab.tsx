
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Pencil, X, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Achievement } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface AchievementsTabProps {
  achievements: Achievement[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, achievement: Partial<Achievement>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const addForm = useForm<Omit<Achievement, 'id'>>({
    defaultValues: {
      title: '',
      description: '',
      date: new Date()
    }
  });

  const editForm = useForm<Omit<Achievement, 'id'>>({
    defaultValues: {
      title: '',
      description: '',
      date: new Date()
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    setDate(new Date());
    addForm.reset({
      title: '',
      description: '',
      date: new Date()
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Achievement, 'id'>) => {
    data.date = date || new Date();
    
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setDate(achievement.date);
    
    editForm.reset({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Achievement, 'id'>) => {
    if (!editingId) return;
    
    data.date = date || new Date();
    
    const success = await onUpdate(editingId, data);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      await onDelete(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Achievements</CardTitle>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Achievement</h3>
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
                      <FormLabel>Achievement Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Employee of the Month" />
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
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your achievement and its significance" 
                          rows={4}
                        />
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
                    {isSaving ? "Saving..." : "Save Achievement"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="border rounded-md p-4">
                {editingId === achievement.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Edit Achievement</h3>
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
                              <FormLabel>Achievement Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. Employee of the Month" />
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
                          rules={{ required: 'Description is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe your achievement and its significance" 
                                  rows={4}
                                />
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
                        <h3 className="font-medium">{achievement.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1">{format(achievement.date, 'PPP')}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-3">{achievement.description}</p>
                    
                    {isEditing && (
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStartEdit(achievement)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(achievement.id)}
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
            No achievements added yet. 
            {isEditing && ' Click "Add Achievement" to add your professional accomplishments.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
