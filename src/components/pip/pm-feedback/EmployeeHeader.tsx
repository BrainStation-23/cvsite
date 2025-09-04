
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EmployeeHeaderProps {
  profile: {
    first_name: string;
    last_name: string;
    current_designation: string;
    profile_image?: string;
    employee_id: string;
  };
  pipStatus: string;
  onBack: () => void;
  onSubmitToHR?: () => void;
  canSubmitToHR?: boolean;
  isSubmitting?: boolean;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  profile,
  pipStatus,
  onBack,
  onSubmitToHR,
  canSubmitToHR = false,
  isSubmitting = false
}) => {
  return (
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.profile_image || ''} alt={`${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-lg font-semibold">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profile.current_designation} • {profile.employee_id}
              </p>
            </div>
            
            <Badge variant="outline" className="ml-2">
              {pipStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {canSubmitToHR && onSubmitToHR && (
          <Button
            onClick={onSubmitToHR}
            disabled={isSubmitting}
            className="shrink-0"
          >
            {isSubmitting ? 'Submitting...' : 'Submit to HR'}
          </Button>
        )}
      </div>
    </div>
  );
};
