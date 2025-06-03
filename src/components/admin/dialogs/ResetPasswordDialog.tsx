
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { UserData } from '@/hooks/use-user-management';

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onResetPassword: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onResetPassword,
  isLoading
}) => {
  const [newPassword, setNewPassword] = useState('');
  
  useEffect(() => {
    if (!isOpen) setNewPassword('');
  }, [isOpen]);
  
  const handleResetPassword = async () => {
    if (!user) return;
    
    const success = await onResetPassword(newPassword);
    if (success) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            Reset password for {user?.firstName} {user?.lastName}
          </p>
          <div className="grid gap-2">
            <Label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResetPassword} disabled={!newPassword || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
