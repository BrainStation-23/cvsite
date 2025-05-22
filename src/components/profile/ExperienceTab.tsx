
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Pencil, X, Save, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Experience } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesignations } from '@/hooks/use-designations';
import { Spinner } from '@/components/ui/spinner';

interface ExperienceTabProps {
  experiences: Experience[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, experience: Partial<Experience>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({
  experiences,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isCurrent, setIsCurrent] = useState(false);
  const { data: designations, isLoading: isLoadingDesignations } = useDesignations();

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

  const handleCancelAdd = () => {
    setIsAdding(false);
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

  const handleStartEdit = (experience: Experience) => {
    setEditingId(experience.id);
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

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Experience, 'id'>) => {
    if (!editingId) return;
    
    data.startDate = startDate || new Date();
    data.endDate = isCurrent ? undefined : endDate;
    data.isCurrent = isCurrent;
    
    const success = await onUpdate(editingId, data);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      await onDelete(id);
    }
  };

  const handleCurrentCheckboxChange = (checked: boolean) => {
    setIsCurrent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Work Experience</CardTitle>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Experience</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleSaveNew)} className="space-y-4">
                <FormField
                  control={addForm.control}
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
                  control={addForm.control}
                  name="designation"
                  rules={{ required: 'Designation is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingDesignations}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingDesignations ? (
                              <div className="flex justify-center p-2">
                                <Spinner size="sm" />
                              </div>
                            ) : (
                              designations?.map((designation) => (
                                <SelectItem key={designation.id} value={designation.name}>
                                  {designation.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
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
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your role and achievements" 
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
                    {isSaving ? "Saving..." : "Save Experience"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {experiences.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {experiences.map((experience) => (
              <AccordionItem key={experience.id} value={experience.id} className="border rounded-md p-4">
                {editingId === experience.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Edit Experience</h3>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
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
                          control={editForm.control}
                          name="designation"
                          rules={{ required: 'Designation is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Designation</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isLoadingDesignations}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select designation" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {isLoadingDesignations ? (
                                      <div className="flex justify-center p-2">
                                        <Spinner size="sm" />
                                      </div>
                                    ) : (
                                      designations?.map((designation) => (
                                        <SelectItem key={designation.id} value={designation.name}>
                                          {designation.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
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
                                  id="current-position-edit" 
                                  checked={isCurrent}
                                  onCheckedChange={handleCurrentCheckboxChange}
                                />
                                <label
                                  htmlFor="current-position-edit"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Current Position
                                </label>
                              </div>
                            </div>
                          </FormItem>
                        </div>
                        
                        <FormField
                          control={editForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe your role and achievements" 
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
                  <>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between pr-4">
                        <div className="font-medium">{experience.designation} at {experience.companyName}</div>
                        <div className="text-muted-foreground text-sm mt-1 md:mt-0">
                          {format(experience.startDate, 'MMM yyyy')} - {experience.isCurrent ? 'Present' : experience.endDate ? format(experience.endDate, 'MMM yyyy') : ''}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-2 space-y-4">
                        {experience.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{experience.description}</p>
                        )}
                        
                        {isEditing && (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStartEdit(experience)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(experience.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No work experience added yet. 
            {isEditing && ' Click "Add Experience" to add your work history.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
