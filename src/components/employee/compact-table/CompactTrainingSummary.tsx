
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
import { Calendar, ExternalLink } from 'lucide-react';
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
        No certifications listed
      </div>
    );
  }

  const isExpiringSoon = (expiry_date?: string) => {
    if (!expiry_date) return false;
    const expiryDate = new Date(expiry_date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0; // Expiring within 90 days
  };

  const isExpired = (expiry_date?: string) => {
    if (!expiry_date) return false;
    const expiryDate = new Date(expiry_date);
    const now = new Date();
    return expiryDate < now;
  };

  const getCertificationBadgeVariant = (training: Training) => {
    if (isExpired(training.expiry_date)) return 'destructive';
    if (isExpiringSoon(training.expiry_date)) return 'secondary';
    return 'outline';
  };

  const displayTrainings = safeTrainings.slice(0, 3);
  const hasMore = safeTrainings.length > 3;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {displayTrainings.map((training) => (
          <Tooltip key={training.id}>
            <TooltipTrigger asChild>
              <Badge 
                variant={getCertificationBadgeVariant(training)}
                className="text-xs px-2 py-0.5 cursor-help"
              >
                <span className="truncate max-w-20">{training.title}</span>
                {training.certificate_url && (
                  <ExternalLink className="h-2 w-2 ml-1" />
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center space-y-1">
                <p className="font-medium">{training.title}</p>
                <p className="text-xs">Provider: {training.provider}</p>
                <p className="text-xs">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Certified: {format(new Date(training.certification_date), 'MMM yyyy')}
                </p>
                {training.expiry_date && (
                  <p className={`text-xs ${isExpired(training.expiry_date) ? 'text-red-500' : isExpiringSoon(training.expiry_date) ? 'text-yellow-500' : 'text-gray-500'}`}>
                    Expires: {format(new Date(training.expiry_date), 'MMM yyyy')}
                  </p>
                )}
                {training.certificate_url && (
                  <p className="text-xs text-blue-500">Click to view certificate</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {hasMore && (
          <Popover>
            <PopoverTrigger asChild>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 cursor-pointer hover:bg-muted"
              >
                +{safeTrainings.length - 3}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">All Certifications</h4>
                <div className="space-y-2">
                  {safeTrainings.map((training) => (
                    <div key={training.id} className="flex items-start justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{training.title}</p>
                        <p className="text-xs text-gray-500">{training.provider}</p>
                        <p className="text-xs text-gray-500">
                          Certified: {format(new Date(training.certification_date), 'MMM yyyy')}
                        </p>
                        {training.expiry_date && (
                          <p className={`text-xs ${isExpired(training.expiry_date) ? 'text-red-500' : isExpiringSoon(training.expiry_date) ? 'text-yellow-500' : 'text-gray-500'}`}>
                            Expires: {format(new Date(training.expiry_date), 'MMM yyyy')}
                          </p>
                        )}
                      </div>
                      {training.certificate_url && (
                        <a 
                          href={training.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CompactTrainingSummary;
