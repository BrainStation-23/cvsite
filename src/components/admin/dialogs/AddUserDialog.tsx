
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
import SbuCombobox from '@/components/admin/user/SbuCombobox';

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
    employeeId: string;
    sbuId?: string | null;
  }) => Promise<boolean>;
  isLoading: boolean;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddUser,
  isLoading
}) => {
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'employee' as UserRole,
    password: '',
    employeeId: '',
    sbuId: null as string | null,
  });
  
  const resetForm = () => {
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      role: 'employee',
      password: '',
      employeeId: '',
      sbuId: null,
    });
  };
  
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);
  
  const handleAddUser = async () => {
    const success = await onAddUser(newUser);
    if (success) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="employeeId">
              Employee ID
            </Label>
            <Input
              id="employeeId"
              type="text"
              value={newUser.employeeId}
              onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">
              Role
            </Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
            >
              <SelectTrigger id="role">
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
            <Label htmlFor="sbu">
              SBU (Optional)
            </Label>
            <SbuCombobox
              value={newUser.sbuId}
              onValueChange={(value) => setNewUser({ ...newUser, sbuId: value })}
              placeholder="Select SBU..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddUser} 
            disabled={isLoading || !newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password || !newUser.employeeId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
