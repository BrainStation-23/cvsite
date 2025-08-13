
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CompleteEngagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newReleaseDate: string) => void;
  title: string;
  description: string;
  currentReleaseDate?: string;
  employeeName: string;
  projectName?: string;
}

export const CompleteEngagementDialog: React.FC<CompleteEngagementDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  currentReleaseDate = '',
  employeeName,
  projectName
}) => {
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(
    currentReleaseDate ? new Date(currentReleaseDate) : undefined
  );

  useEffect(() => {
    setReleaseDate(currentReleaseDate ? new Date(currentReleaseDate) : undefined);
  }, [currentReleaseDate, isOpen]);

  const handleConfirm = () => {
    const dateString = releaseDate ? format(releaseDate, 'yyyy-MM-dd') : '';
    onConfirm(dateString);
  };

  const handleDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setReleaseDate(date);
    } else {
      setReleaseDate(undefined);
    }
  };

  const setToToday = () => {
    setReleaseDate(new Date());
  };

  const keepCurrentDate = () => {
    setReleaseDate(currentReleaseDate ? new Date(currentReleaseDate) : undefined);
  };

  const clearDate = () => {
    setReleaseDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Assignment Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Assignment Details</h4>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Employee:</span> {employeeName}</div>
              {projectName && (
                <div><span className="font-medium">Project:</span> {projectName}</div>
              )}
              <div>
                <span className="font-medium">Current Release Date:</span>{' '}
                {currentReleaseDate ? (
                  <Badge variant="outline" className="ml-1">
                    {format(new Date(currentReleaseDate), 'MMM dd, yyyy')}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </div>
            </div>
          </div>

          {/* Release Date Section */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Release Date</label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !releaseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {releaseDate ? format(releaseDate, 'PPP') : 'Select release date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={releaseDate}
                      onSelect={handleDateSelect}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Quick Actions:</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setToToday}
                  className="text-xs"
                >
                  Set to Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={keepCurrentDate}
                  className="text-xs"
                >
                  Keep Current
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearDate}
                  className="text-xs"
                >
                  Clear Date
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Mark Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
