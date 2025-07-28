import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CalendarIcon, X, Info, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Project } from '@/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AiEnhanceDialog } from '@/components/ui/ai-enhance-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [responsibility, setResponsibility] = useState<string>(project?.responsibility || '');
  
  // AI Enhancement states
  const [isDescriptionEnhanceOpen, setIsDescriptionEnhanceOpen] = useState(false);
  const [isResponsibilityEnhanceOpen, setIsResponsibilityEnhanceOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: project?.name || '',
      role: project?.role || '',
      url: project?.url || ''
    }
  });

  const descriptionRequirements = `Please rewrite this project description to be:
- Professional and clear
- Focused on the project's objectives and outcomes
- Highlight the technical challenges solved
- Emphasize business impact and value delivered
- Use active voice and strong action words
- Include relevant metrics or achievements where applicable
- Make it concise but comprehensive`;

  const responsibilityRequirements = `Please rewrite these project responsibilities to be:
- Clear and specific about your role and contributions
- Use strong action verbs (Led, Developed, Implemented, Designed, etc.)
- Quantify achievements with metrics where possible
- Highlight technical skills and technologies used
- Show progression and ownership of tasks
- Emphasize collaboration and leadership aspects
- Focus on deliverables and outcomes`;

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
      responsibility: responsibility,
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
    <TooltipProvider>
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
                    <Input {...field} placeholder="Enter project name" data-tour="project-name" />
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
                    <Input {...field} placeholder="e.g. Lead Developer" data-tour="project-role" />
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
                      data-tour="project-start-date"
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
                        data-tour="project-end-date"
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
                      data-tour="current-project-checkbox"
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
              <div className="flex items-center gap-2 mb-2">
                <FormLabel>Description</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{descriptionRequirements}</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionEnhanceOpen(true)}
                  className="h-6 px-2 text-xs"
                  disabled={!description.trim()}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Enhance with AI
                </Button>
              </div>
              <FormControl>
                <div data-tour="project-description">
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe the project and your contributions"
                    className="min-h-[150px]"
                  />
                </div>
              </FormControl>
              {!description && (
                <p className="text-sm text-destructive">Description is required</p>
              )}
            </FormItem>

            <FormItem>
              <div className="flex items-center gap-2 mb-2">
                <FormLabel>Responsibility</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{responsibilityRequirements}</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsResponsibilityEnhanceOpen(true)}
                  className="h-6 px-2 text-xs"
                  disabled={!responsibility.trim()}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Enhance with AI
                </Button>
              </div>
              <FormControl>
                <div>
                  <RichTextEditor
                    value={responsibility}
                    onChange={setResponsibility}
                    placeholder="Describe your specific responsibilities and duties"
                    className="min-h-[150px]"
                  />
                </div>
              </FormControl>
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
                  data-tour="project-technologies"
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
                    <Input {...field} placeholder="https://..." type="url" data-tour="project-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !description.trim()} data-tour="project-save-button">
                {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Project"}
              </Button>
            </div>
          </form>
        </Form>

        <AiEnhanceDialog
          isOpen={isDescriptionEnhanceOpen}
          onClose={() => setIsDescriptionEnhanceOpen(false)}
          onEnhanced={setDescription}
          originalContent={description}
          defaultRequirements={descriptionRequirements}
          title="Enhance Project Description with AI"
          description="Review the requirements and enhance your project description with AI."
        />

        <AiEnhanceDialog
          isOpen={isResponsibilityEnhanceOpen}
          onClose={() => setIsResponsibilityEnhanceOpen(false)}
          onEnhanced={setResponsibility}
          originalContent={responsibility}
          defaultRequirements={responsibilityRequirements}
          title="Enhance Project Responsibility with AI"
          description="Review the requirements and enhance your project responsibilities with AI."
        />
      </div>
    </TooltipProvider>
  );
};
