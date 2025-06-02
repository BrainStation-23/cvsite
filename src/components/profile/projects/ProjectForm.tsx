
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CalendarIcon, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Project } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface ProjectFormProps {
  project?: Project;
  isEditing?: boolean;
  isSaving: boolean;
  onSave: (project: Omit<Project, 'id'>) => Promise<boolean>;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  isEditing = false,
  isSaving,
  onSave,
  onCancel
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    project?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(project?.endDate);
  const [isCurrent, setIsCurrent] = useState(project?.isCurrent || false);
  const [techInput, setTechInput] = useState<string>('');
  const [technologies, setTechnologies] = useState<string[]>(
    project?.technologiesUsed || []
  );
  const [description, setDescription] = useState<string>(project?.description || '');

  const form = useForm({
    defaultValues: {
      name: project?.name || '',
      role: project?.role || '',
      url: project?.url || ''
    }
  });

  const handleCurrentCheckboxChange = (checked: boolean) => {
    setIsCurrent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleSubmit = async (data: any) => {
    const projectData = {
      ...data,
      description: description,
      startDate: startDate || new Date(),
      endDate: isCurrent ? undefined : endDate,
      isCurrent: isCurrent,
      technologiesUsed: technologies
    };
    
    const success = await onSave(projectData);
    if (success) {
      onCancel();
    }
  };

  return (
    <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'Project name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter project name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            rules={{ required: 'Your role is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Role</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Lead Developer" />
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
                    id="current-project-form" 
                    checked={isCurrent}
                    onCheckedChange={handleCurrentCheckboxChange}
                  />
                  <label
                    htmlFor="current-project-form"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Current Project
                  </label>
                </div>
              </div>
            </FormItem>
          </div>
          
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe the project and your contributions"
                className="min-h-[150px]"
              />
            </FormControl>
            {!description && (
              <p className="text-sm text-destructive">Description is required</p>
            )}
          </FormItem>
          
          <FormItem>
            <FormLabel>Technologies Used</FormLabel>
            <div className="flex space-x-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
              />
              <Button type="button" onClick={addTechnology}>Add</Button>
            </div>
            
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {technologies.map((tech) => (
                  <div key={tech} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md flex items-center text-sm">
                    {tech}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 ml-2"
                      onClick={() => removeTechnology(tech)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </FormItem>
          
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project URL (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !description.trim()}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Project"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
