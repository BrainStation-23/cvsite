
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import { AlertTriangle } from 'lucide-react';

interface PIPEmployeeSelectionProps {
  selectedProfileId: string | null;
  onProfileChange: (value: string | null) => void;
  error?: string;
  disabled?: boolean;
}

export const PIPEmployeeSelection: React.FC<PIPEmployeeSelectionProps> = ({
  selectedProfileId,
  onProfileChange,
  error,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-3 h-3 rounded-full ${selectedProfileId ? 'bg-green-500' : 'bg-gray-300'}`} />
          Step 1: Select Employee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="profile" className="text-sm font-medium">Select Employee *</Label>
          <ProfileCombobox
            value={selectedProfileId}
            onValueChange={onProfileChange}
            placeholder="Search and select employee..."
            label="Employee"
            disabled={disabled}
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
