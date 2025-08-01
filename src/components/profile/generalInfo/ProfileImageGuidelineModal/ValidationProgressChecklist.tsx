
import React from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { ValidationProgress } from './types';

interface ValidationProgressChecklistProps {
  progress: ValidationProgress[];
  isAnalyzing: boolean;
}

interface ValidationSubtask {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  passed?: boolean;
  details?: string;
}

// Extend ValidationProgress to allow optional subtasks
interface ValidationProgressWithSubtasks extends ValidationProgress {
  subtasks?: ValidationSubtask[];
}

const ValidationProgressChecklist: React.FC<ValidationProgressChecklistProps> = ({
  progress,
  isAnalyzing
}) => {
  if (progress.length === 0) return null;

  const getStatusIcon = (item: { status: string; passed?: boolean }) => {
    switch (item.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return item.passed ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        );
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (item: { status: string; passed?: boolean }) => {
    switch (item.status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-600 font-medium';
      case 'completed':
        return item.passed ? 'text-green-600' : 'text-red-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const renderSubtasks = (subtasks: ValidationSubtask[]) => (
    <ul className="ml-6 mt-1 space-y-1">
      {subtasks.map((sub) => (
        <li key={sub.id} className="flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">{getStatusIcon(sub)}</span>
          <span className={`text-xs ${getStatusColor(sub)}`}>{sub.label}</span>
        </li>
      ))}
    </ul>
  );


  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
        {isAnalyzing ? 'Analyzing Image...' : 'Analysis Complete'}
      </h4>
      
      <div className="space-y-2">
        {progress.map((item) => {
          // Type assertion to allow subtasks
          const itemWithSubtasks = item as ValidationProgressWithSubtasks;
          return (
            <div key={item.id} className="flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${getStatusColor(item)}`}>
                    {item.label}
                  </div>
                  {item.details && item.status !== 'running' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.details}
                    </div>
                  )}
                </div>
              </div>
              {/* Render subtasks if present */}
              {itemWithSubtasks.subtasks && itemWithSubtasks.subtasks.length > 0 && (
                renderSubtasks(itemWithSubtasks.subtasks)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ValidationProgressChecklist;
