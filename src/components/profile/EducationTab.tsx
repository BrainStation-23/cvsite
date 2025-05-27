import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Pencil, X, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Education } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { DegreeCombobox } from '@/components/admin/degree/DegreeCombobox';
import { DepartmentCombobox } from '@/components/admin/department/DepartmentCombobox';
import { usePlatformSettings } from '@/hooks/use-platform-settings';

interface EducationTabProps {
  education: Education[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (education: Omit<Education, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, education: Partial<Education>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const EducationTab: React.FC<EducationTabProps> = ({
  education,
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

  // Fetch platform settings for dropdowns
  const { items: universities } = usePlatformSettings('universities');
  const { items: departments } = usePlatformSettings('departments');
  const { items: degrees } = usePlatformSettings('degrees');

  const addForm = useForm<Omit<Education, 'id'>>({
    defaultValues: {
      university: '',
      degree: '',
      startDate: new Date(),
      isCurrent: false
    }
  });

  const editForm = useForm<Omit<Education, 'id'>>({
    defaultValues: {
      university: '',
      degree: '',
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
      university: '',
      degree: '',
      startDate: new Date(),
      isCurrent: false
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Education, 'id'>) => {
    data.startDate = startDate || new Date();
    data.endDate = isCurrent ? undefined : endDate;
    data.isCurrent = isCurrent;
    
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (education: Education) => {
    setEditingId(education.id);
    setStartDate(education.startDate);
    setEndDate(education.endDate);
    setIsCurrent(education.isCurrent || false);
    
    editForm.reset({
      university: education.university,
      degree: education.degree || '',
      department: education.department,
      gpa: education.gpa || '',
      startDate: education.startDate,
      endDate: education.endDate,
      isCurrent: education.isCurrent || false
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Education, 'id'>) => {
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
    if (window.confirm('Are you sure you want to delete this education entry?')) {
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
          <CardTitle>Education</CardTitle>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Education</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleSaveNew)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="university"
                  rules={{ required: 'University is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University / Institution</FormLabel>
                      <FormControl>
                        <UniversityCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select university"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="degree"
                    rules={{ required: 'Degree is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <DegreeCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select degree"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <DepartmentCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select department"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                          id="current-education" 
                          checked={isCurrent}
                          onCheckedChange={handleCurrentCheckboxChange}
                        />
                        <label
                          htmlFor="current-education"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Currently Studying
                        </label>
                      </div>
                    </div>
                  </FormItem>
                </div>
                
                <FormField
                  control={addForm.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPA / Grade (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 3.8/4.0" />
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
                    {isSaving ? "Saving..." : "Save Education"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {education.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {education.map((edu) => (
              <AccordionItem key={edu.id} value={edu.id} className="border rounded-md p-4">
                {editingId === edu.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Edit Education</h3>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="university"
                          rules={{ required: 'University is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>University / Institution</FormLabel>
                              <FormControl>
                                <UniversityCombobox
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="Select university"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="degree"
                            rules={{ required: 'Degree is required' }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Degree</FormLabel>
                                <FormControl>
                                  <DegreeCombobox
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select degree"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={editForm.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                  <DepartmentCombobox
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select department"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
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
                                  id="current-education-edit" 
                                  checked={isCurrent}
                                  onCheckedChange={handleCurrentCheckboxChange}
                                />
                                <label
                                  htmlFor="current-education-edit"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Currently Studying
                                </label>
                              </div>
                            </div>
                          </FormItem>
                        </div>
                        
                        <FormField
                          control={editForm.control}
                          name="gpa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPA / Grade (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. 3.8/4.0" />
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
                        <div className="font-medium">{edu.degree} {edu.department ? `- ${edu.department}` : ''}</div>
                        <div className="text-muted-foreground text-sm mt-1 md:mt-0">
                          {format(edu.startDate, 'MMM yyyy')} - {edu.isCurrent ? 'Present' : edu.endDate ? format(edu.endDate, 'MMM yyyy') : ''}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-2 space-y-4">
                        <div>
                          <div className="font-medium">{edu.university}</div>
                          {edu.gpa && <div className="text-sm text-muted-foreground mt-1">GPA: {edu.gpa}</div>}
                        </div>
                        
                        {isEditing && (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStartEdit(edu)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(edu.id)}
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
            No education history added yet. 
            {isEditing && ' Click "Add Education" to add your educational background.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
