
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

interface ProjectFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  initialData?: Project | null;
  title: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  title
}) => {
  const [formData, setFormData] = useState({
    project_name: initialData?.project_name || '',
    client_name: initialData?.client_name || '',
    project_manager: initialData?.project_manager || '',
    budget: initialData?.budget?.toString() || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const projectData = {
      project_name: formData.project_name.trim(),
      client_name: formData.client_name.trim() || null,
      project_manager: formData.project_manager.trim() || null,
      budget: formData.budget ? parseFloat(formData.budget) : null
    };

    const success = await onSubmit(projectData);
    
    if (success) {
      setFormData({
        project_name: '',
        client_name: '',
        project_manager: '',
        budget: ''
      });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => handleChange('project_name', e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => handleChange('client_name', e.target.value)}
              placeholder="Enter client name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_manager">Project Manager</Label>
            <Input
              id="project_manager"
              value={formData.project_manager}
              onChange={(e) => handleChange('project_manager', e.target.value)}
              placeholder="Enter project manager name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              placeholder="Enter budget amount"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.project_name.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
