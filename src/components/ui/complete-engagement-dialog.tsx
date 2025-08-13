
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
import DatePicker from '@/components/admin/user/DatePicker';
import { format } from 'date-fns';

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
  const [releaseDate, setReleaseDate] = useState(currentReleaseDate);

  useEffect(() => {
    setReleaseDate(currentReleaseDate);
  }, [currentReleaseDate, isOpen]);

  const handleConfirm = () => {
    onConfirm(releaseDate);
  };

  const setToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setReleaseDate(today);
  };

  const keepCurrentDate = () => {
    setReleaseDate(currentReleaseDate);
  };

  const clearDate = () => {
    setReleaseDate('');
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
                <DatePicker
                  value={releaseDate}
                  onChange={setReleaseDate}
                  placeholder="Select release date"
                />
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
