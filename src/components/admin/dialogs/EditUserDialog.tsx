
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/types';
import { UserData } from '@/hooks/use-user-management';
import SbuCombobox from '@/components/admin/user/SbuCombobox';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onUpdateUser: (userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    employeeId: string;
    sbuId?: string | null;
    expertiseId?: string | null;
    resourceTypeId?: string | null;
    dateOfJoining?: string | null;
    careerStartDate?: string | null;
    managerId?: string | null;
    dateOfBirth?: string | null;
    resignationDate?: string | null;
    exitDate?: string | null;
    active?: boolean;
    hasOverhead?: boolean;
    password?: string;
  }) => Promise<boolean>;
  isLoading: boolean;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onUpdateUser,
  isLoading
}) => {
  const [editUser, setEditUser] = useState({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole,
    employeeId: '',
    sbuId: null as string | null,
    expertiseId: null as string | null,
    resourceTypeId: null as string | null,
    dateOfJoining: '',
    careerStartDate: '',
    managerId: null as string | null,
    dateOfBirth: '',
    resignationDate: '',
    exitDate: '',
    active: true,
    hasOverhead: true,
    password: '',
  });
  
  useEffect(() => {
    if (user) {
      setEditUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        employeeId: user.employeeId || '',
        sbuId: user.sbuId || null,
        expertiseId: user.expertiseId || null,
        resourceTypeId: user.resourceTypeId || null,
        dateOfJoining: user.dateOfJoining || '',
        careerStartDate: user.careerStartDate || '',
        managerId: user.managerId || null,
        dateOfBirth: user.dateOfBirth || '',
        resignationDate: user.resignationDate || '',
        exitDate: user.exitDate || '',
        active: user.active ?? true,
        hasOverhead: user.hasOverhead ?? true,
        password: '',
      });
    }
  }, [user]);
  
  const handleUpdateUser = async () => {
    const success = await onUpdateUser(editUser);
    if (success) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-email">
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-employeeId">
              Employee ID
            </Label>
            <Input
              id="edit-employeeId"
              type="text"
              value={editUser.employeeId}
              onChange={(e) => setEditUser({ ...editUser, employeeId: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-firstName">
                First Name
              </Label>
              <Input
                id="edit-firstName"
                type="text"
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lastName">
                Last Name
              </Label>
              <Input
                id="edit-lastName"
                type="text"
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-role">
              Role
            </Label>
            <Select
              value={editUser.role}
              onValueChange={(value) => setEditUser({ ...editUser, role: value as UserRole })}
            >
              <SelectTrigger id="edit-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-sbu">
              SBU (Optional)
            </Label>
            <SbuCombobox
              value={editUser.sbuId}
              onValueChange={(value) => setEditUser({ ...editUser, sbuId: value })}
              placeholder="Select SBU..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-password">
              New Password (optional)
            </Label>
            <Input
              id="edit-password"
              type="password"
              value={editUser.password}
              onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateUser} 
            disabled={isLoading || !editUser.email || !editUser.firstName || !editUser.lastName || !editUser.employeeId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update User'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
