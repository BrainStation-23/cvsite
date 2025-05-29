
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ExternalLink, Calendar, User, GripVertical } from 'lucide-react';
import { Project } from '@/types';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DeviconService } from '@/utils/deviconUtils';

interface ProjectCardProps {
  project: Project;
  isEditing: boolean;
  isDraggable?: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isEditing,
  isDraggable = false,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: project.id,
    disabled: !isDraggable || !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  const formatDateRange = () => {
    const start = format(project.startDate, 'MMM yyyy');
    const end = project.isCurrent ? 'Present' : project.endDate ? format(project.endDate, 'MMM yyyy') : '';
    return `${start} - ${end}`;
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 hover:shadow-lg border-l-4 border-l-cvsite-teal bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${
        isDragging ? 'ring-2 ring-cvsite-teal shadow-xl opacity-90 rotate-2' : ''
      } ${isDraggable && isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {isDraggable && isEditing && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0 mt-1"
              >
                <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center text-cvsite-teal font-medium mb-2">
                    <User className="h-4 w-4 mr-1" />
                    {project.role}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDateRange()}
                  {project.isCurrent && (
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                      Current
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Technologies */}
              {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Technologies Used:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologiesUsed.map((tech) => (
                      <div 
                        key={tech} 
                        className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        <img 
                          src={DeviconService.getDeviconUrl(tech)} 
                          alt={tech}
                          className="w-4 h-4"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="capitalize">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project URL */}
              {project.url && (
                <div className="mb-4">
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cvsite-teal hover:text-cvsite-teal/80 font-medium text-sm transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Project
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {isEditing && (
            <div className="flex items-start space-x-2 flex-shrink-0 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(project)}
                className="h-8 px-3"
              >
                <Pencil className="h-3 w-3 mr-1" /> 
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                className="h-8 px-3"
              >
                <Trash2 className="h-3 w-3 mr-1" /> 
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
