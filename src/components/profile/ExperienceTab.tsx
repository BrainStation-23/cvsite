
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, X, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Experience } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DesignationCombobox } from '@/components/admin/designation/DesignationCombobox';
import { ExperienceGroupedTab } from './experience/ExperienceGroupedTab';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface ExperienceTabProps {
  experiences: Experience[];
  isEditing: boolean;
  isSaving: boolean;
  profileId?: string;
  onSave: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, experience: Partial<Experience>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({
  experiences,
  isEditing,
  isSaving,
  profileId,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isCurrent, setIsCurrent] = useState(false);

  const addForm = useForm<Omit<Experience, 'id'>>({
    defaultValues: {
      companyName: '',
      designation: '',
      description: '',
      startDate: new Date(),
      isCurrent: false
    }
  });

  const editForm = useForm<Omit<Experience, 'id'>>({
    defaultValues: {
      companyName: '',
      designation: '',
      description: '',
      startDate: new Date(),
      isCurrent: false
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    setEditingExperience(null);
    setStartDate(new Date());
    setEndDate(undefined);
    setIsCurrent(false);
    addForm.reset({
      companyName: '',
      designation: '',
      description: '',
      startDate: new Date(),
      isCurrent: false
    });
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setIsAdding(false);
    setStartDate(experience.startDate);
    setEndDate(experience.endDate);
    setIsCurrent(experience.isCurrent || false);
    
    editForm.reset({
      companyName: experience.companyName,
      designation: experience.designation,
      description: experience.description || '',
      startDate: experience.startDate,
      endDate: experience.endDate,
      isCurrent: experience.isCurrent || false
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingExperience(null);
  };

  const handleSaveNew = async (data: Omit<Experience, 'id'>) => {
    data.startDate = startDate || new Date();
    data.endDate = isCurrent ? undefined : endDate;
    data.isCurrent = isCurrent;
    
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async (data: Omit<Experience, 'id'>) => {
    if (!editingExperience) return;
    
    data.startDate = startDate || new Date();
    data.endDate = isCurrent ? undefined : endDate;
    data.isCurrent = isCurrent;
    
    const success = await onUpdate(editingExperience.id, data);
    if (success) {
      setEditingExperience(null);
    }
  };

  const handleCurrentCheckboxChange = (checked: boolean) => {
    setIsCurrent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  // Show add/edit form if we're adding or editing
  if (isAdding || editingExperience) {
    const form = isAdding ? addForm : editForm;
    const onSubmit = isAdding ? handleSaveNew : handleSaveEdit;
    const onCancel = isAdding ? handleCancelAdd : handleCancelEdit;
    const title = isAdding ? 'Add New Experience' : 'Edit Experience';

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                rules={{ required: 'Company name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="designation"
                rules={{ required: 'Designation is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <DesignationCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select designation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
                
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isCurrent}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate && !isCurrent ? format(endDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => (
                            (startDate ? date < startDate : false) || 
                            date > new Date()
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="current-position" 
                        checked={isCurrent}
                        onCheckedChange={handleCurrentCheckboxChange}
                      />
                      <label
                        htmlFor="current-position"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Current Position
                      </label>
                    </div>
                  </div>
                </FormItem>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Describe your role and achievements"
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : isAdding ? "Save Experience" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Show the grouped experience view
  return (
    <ExperienceGroupedTab
      isEditing={isEditing}
      isSaving={isSaving}
      profileId={profileId}
      onAddNew={handleStartAddNew}
      onEditExperience={handleEditExperience}
      onDeleteExperience={onDelete}
    />
  );
};
