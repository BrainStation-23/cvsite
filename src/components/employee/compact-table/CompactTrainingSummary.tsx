
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
import { Award, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { format, isAfter, isBefore, addMonths } from 'date-fns';

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
  trainings?: Training[];
}

const CompactTrainingSummary: React.FC<CompactTrainingSummaryProps> = ({
  trainings = []
}) => {
  if (trainings.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No certifications
      </div>
    );
  }

  const sortedTrainings = [...trainings].sort((a, b) => 
    new Date(b.certification_date).getTime() - new Date(a.certification_date).getTime()
  );

  const getExpiryStatus = (training: Training) => {
    if (!training.expiry_date) return null;
    
    const expiryDate = new Date(training.expiry_date);
    const now = new Date();
    const threeMonthsFromNow = addMonths(now, 3);
    
    if (isBefore(expiryDate, now)) {
      return { status: 'expired', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (isBefore(expiryDate, threeMonthsFromNow)) {
      return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return { status: 'valid', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const recentTrainings = sortedTrainings.slice(0, 2);
  const hasMore = sortedTrainings.length > 2;

  return (
    <TooltipProvider>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Award className="h-3 w-3" />
          <span>Certifications ({trainings.length})</span>
        </div>
        
        <div className="space-y-1.5">
          {recentTrainings.map((training) => {
            const expiryStatus = getExpiryStatus(training);
            
            return (
              <Tooltip key={training.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-start gap-1.5 p-1.5 rounded border bg-muted/20 hover:bg-muted/40 transition-colors cursor-help">
                    <Award className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <p className="text-xs font-medium truncate leading-tight">{training.title}</p>
                        {expiryStatus && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1 py-0 h-4 ${expiryStatus.color}`}
                          >
                            {expiryStatus.status === 'expired' && <AlertTriangle className="h-2 w-2 mr-0.5" />}
                            {expiryStatus.status === 'expiring' ? 'Exp' : 
                             expiryStatus.status === 'expired' ? 'Exp' : 'OK'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-tight">{training.provider}</p>
                      {training.certificate_url && (
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground mt-0.5" />
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{training.title}</p>
                    <p className="text-xs">Provider: {training.provider}</p>
                    <p className="text-xs">Certified: {format(new Date(training.certification_date), 'PPP')}</p>
                    {training.expiry_date && (
                      <p className="text-xs">Expires: {format(new Date(training.expiry_date), 'PPP')}</p>
                    )}
                    {training.is_renewable && (
                      <p className="text-xs text-blue-600">Renewable certification</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {hasMore && (
            <Popover>
              <PopoverTrigger asChild>
                <div className="text-center">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted text-xs px-2 py-0.5"
                  >
                    +{sortedTrainings.length - 2} more
                  </Badge>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">All Certifications</h4>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {sortedTrainings.map((training) => {
                      const expiryStatus = getExpiryStatus(training);
                      
                      return (
                        <div key={training.id} className="flex items-start gap-1.5 p-1.5 rounded border">
                          <Award className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <p className="text-xs font-medium">{training.title}</p>
                              {expiryStatus && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-1 py-0 h-4 ${expiryStatus.color}`}
                                >
                                  {expiryStatus.status === 'expired' && <AlertTriangle className="h-2 w-2 mr-0.5" />}
                                  {expiryStatus.status === 'expiring' ? 'Expiring' : 
                                   expiryStatus.status === 'expired' ? 'Expired' : 'Valid'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{training.provider}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="h-2 w-2" />
                              <span>{format(new Date(training.certification_date), 'MMM yyyy')}</span>
                              {training.certificate_url && (
                                <a 
                                  href={training.certificate_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-1 hover:text-primary"
                                >
                                  <ExternalLink className="h-2 w-2" />
                                </a>
                              )}
                            </div>
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
