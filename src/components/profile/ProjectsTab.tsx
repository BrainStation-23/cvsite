import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, X, CalendarIcon, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Project } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ProjectCard } from './projects/ProjectCard';
import { TechnicalSkillInput } from './skills/TechnicalSkillInput';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

interface ProjectsTabProps {
  projects: Project[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (project: Omit<Project, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, project: Partial<Project>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorderProjects?: (reorderedProjects: Project[]) => Promise<boolean>;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete,
  onReorderProjects
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isCurrent, setIsCurrent] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    
    const search = searchTerm.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(search) ||
      project.role.toLowerCase().includes(search) ||
      project.description.toLowerCase().includes(search) ||
      (project.technologiesUsed && project.technologiesUsed.some(tech => 
        tech.toLowerCase().includes(search)
      ))
    );
  }, [projects, searchTerm]);

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

  const handleCurrentCheckboxChange = (checked: boolean) => {
    setIsCurrent(checked);
    if (checked) {
      setEndDate(undefined);
    }
  };

  const addTechnology = (tech: string) => {
    if (tech.trim() && !technologies.includes(tech.trim())) {
      setTechnologies([...technologies, tech.trim()]);
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderProjects) {
      const oldIndex = projects.findIndex(project => project.id === active.id);
      const newIndex = projects.findIndex(project => project.id === over?.id);
      
      const reorderedProjects = arrayMove(projects, oldIndex, newIndex);
      onReorderProjects(reorderedProjects);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Projects</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            {isEditing && !isAdding && !editingId && (
              <Button variant="outline" onClick={handleStartAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            )}
          </div>
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
                  <div className="space-y-2">
                    <TechnicalSkillInput
                      value=""
                      onChange={addTechnology}
                      placeholder="Search and add technologies..."
                    />
                    
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
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
                  </div>
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

        {editingId && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
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
                  <div className="space-y-2">
                    <TechnicalSkillInput
                      value=""
                      onChange={addTechnology}
                      placeholder="Search and add technologies..."
                    />
                    
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
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
                  </div>
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
        )}
        
        {filteredProjects.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={filteredProjects.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isEditing={isEditing}
                    isDraggable={isEditing && !searchTerm && onReorderProjects !== undefined}
                    onEdit={handleStartEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            {searchTerm ? (
              <div>
                <p className="text-lg font-medium mb-2">No projects found</p>
                <p>Try adjusting your search terms or add a new project.</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">No projects added yet</p>
                {isEditing && <p>Click "Add Project" to add projects you've worked on.</p>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
