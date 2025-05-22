
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Pencil, X, CalendarIcon, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Project } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ProjectsTabProps {
  projects: Project[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (project: Omit<Project, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, project: Partial<Project>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
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
  const [techInput, setTechInput] = useState<string>('');
  const [technologies, setTechnologies] = useState<string[]>([]);

  const addForm = useForm<Omit<Project, 'id' | 'technologiesUsed'>>({
    defaultValues: {
      name: '',
      role: '',
      description: '',
      startDate: new Date(),
      isCurrent: false,
      url: ''
    }
  });

  const editForm = useForm<Omit<Project, 'id' | 'technologiesUsed'>>({
    defaultValues: {
      name: '',
      role: '',
      description: '',
      startDate: new Date(),
      isCurrent: false,
      url: ''
    }
  });

  const handleStartAddNew = () => {
    setIsAdding(true);
    setStartDate(new Date());
    setEndDate(undefined);
    setIsCurrent(false);
    setTechnologies([]);
    setTechInput('');
    addForm.reset({
      name: '',
      role: '',
      description: '',
      startDate: new Date(),
      isCurrent: false,
      url: ''
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: Omit<Project, 'id' | 'technologiesUsed'>) => {
    const projectData = {
      ...data,
      startDate: startDate || new Date(),
      endDate: isCurrent ? undefined : endDate,
      isCurrent: isCurrent,
      technologiesUsed: technologies
    };
    
    const success = await onSave(projectData);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (project: Project) => {
    setEditingId(project.id);
    setStartDate(project.startDate);
    setEndDate(project.endDate);
    setIsCurrent(project.isCurrent || false);
    setTechnologies(project.technologiesUsed || []);
    setTechInput('');
    
    editForm.reset({
      name: project.name,
      role: project.role,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      isCurrent: project.isCurrent || false,
      url: project.url || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (data: Omit<Project, 'id' | 'technologiesUsed'>) => {
    if (!editingId) return;
    
    const projectData = {
      ...data,
      startDate: startDate || new Date(),
      endDate: isCurrent ? undefined : endDate,
      isCurrent: isCurrent,
      technologiesUsed: technologies
    };
    
    const success = await onUpdate(editingId, projectData);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await onDelete(id);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Projects</CardTitle>
          {isEditing && !isAdding && !editingId && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Project</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleSaveNew)} className="space-y-4">
                <FormField
                  control={addForm.control}
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
                  control={addForm.control}
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
                          id="current-project" 
                          checked={isCurrent}
                          onCheckedChange={handleCurrentCheckboxChange}
                        />
                        <label
                          htmlFor="current-project"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Current Project
                        </label>
                      </div>
                    </div>
                  </FormItem>
                </div>
                
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
                          placeholder="Describe the project and your contributions" 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  control={addForm.control}
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
                  <Button type="button" variant="outline" onClick={handleCancelAdd}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {projects.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {projects.map((project) => (
              <AccordionItem key={project.id} value={project.id} className="border rounded-md p-4">
                {editingId === project.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Edit Project</h3>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
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
                          control={editForm.control}
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
                                  id="current-project-edit" 
                                  checked={isCurrent}
                                  onCheckedChange={handleCurrentCheckboxChange}
                                />
                                <label
                                  htmlFor="current-project-edit"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Current Project
                                </label>
                              </div>
                            </div>
                          </FormItem>
                        </div>
                        
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
                                  placeholder="Describe the project and your contributions" 
                                  rows={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                          control={editForm.control}
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
                        <div className="font-medium">{project.name} - {project.role}</div>
                        <div className="text-muted-foreground text-sm mt-1 md:mt-0">
                          {format(project.startDate, 'MMM yyyy')} - {project.isCurrent ? 'Present' : project.endDate ? format(project.endDate, 'MMM yyyy') : ''}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-2 space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{project.description}</p>
                          
                          {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Technologies:</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.technologiesUsed.map((tech) => (
                                  <span key={tech} className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {project.url && (
                            <div className="mt-3">
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cvsite-teal flex items-center text-sm hover:underline"
                              >
                                View Project <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {isEditing && (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStartEdit(project)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(project.id)}
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
            No projects added yet. 
            {isEditing && ' Click "Add Project" to add projects you\'ve worked on.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
