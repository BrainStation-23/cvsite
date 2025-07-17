
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Award, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Training {
  id: string;
  title: string;
  provider: string;
  certification_date: string;
  is_renewable?: boolean;
  expiry_date?: string;
  certificate_url?: string;
}

interface CompactTrainingSummaryProps {
  trainings?: Training[] | null;
}

const CompactTrainingSummary: React.FC<CompactTrainingSummaryProps> = ({
  trainings
}) => {
  // Handle null/undefined trainings by converting to empty array
  const safeTrainings = trainings || [];

  if (safeTrainings.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No certifications
      </div>
    );
  }

  // Sort by certification date, most recent first
  const sortedTrainings = [...safeTrainings].sort((a, b) => 
    new Date(b.certification_date).getTime() - new Date(a.certification_date).getTime()
  );

  const getExpiryStatus = (training: Training) => {
    if (!training.is_renewable || !training.expiry_date) return 'valid';
    
    const expiryDate = new Date(training.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'expiring': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const recentTrainings = sortedTrainings.slice(0, 2);
  const hasMore = sortedTrainings.length > 2;

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Award className="h-3 w-3" />
          <span>Certifications ({safeTrainings.length})</span>
        </div>
        
        <div className="space-y-1">
          {recentTrainings.map((training) => {
            const status = getExpiryStatus(training);
            return (
              <Tooltip key={training.id}>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 cursor-help ${getStatusColor(status)}`}
                    >
                      <span className="truncate max-w-24">{training.title}</span>
                      {training.is_renewable && (
                        <Clock className="h-2 w-2 ml-1" />
                      )}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {training.provider} • {format(new Date(training.certification_date), 'MMM yyyy')}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{training.title}</p>
                    <p className="text-xs">Provider: {training.provider}</p>
                    <p className="text-xs">Date: {format(new Date(training.certification_date), 'MMM dd, yyyy')}</p>
                    {training.expiry_date && (
                      <p className="text-xs">
                        Expires: {format(new Date(training.expiry_date), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {hasMore && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 cursor-pointer hover:bg-muted"
                >
                  +{sortedTrainings.length - 2} more
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    All Certifications
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sortedTrainings.map((training) => {
                      const status = getExpiryStatus(training);
                      return (
                        <div key={training.id} className="border rounded p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(status)}`}
                            >
                              {training.title}
                            </Badge>
                            {training.is_renewable && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Renewable certification</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {training.provider} • {format(new Date(training.certification_date), 'MMM yyyy')}
                            </div>
                            {training.expiry_date && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                Expires: {format(new Date(training.expiry_date), 'MMM yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CompactTrainingSummary;
