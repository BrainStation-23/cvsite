
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Edit, Trash, Clock, Calendar } from 'lucide-react';
import { UserData } from '@/hooks/use-user-management';
import { formatDistanceToNow } from 'date-fns';

interface UserListProps {
  users: UserData[];
  isLoading: boolean;
  onEdit: (user: UserData) => void;
  onResetPassword: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  onEdit,
  onResetPassword,
  onDelete
}) => {
  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatFullDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cvsite-teal" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  Created
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  Last Login
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {user.employeeId || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.sbuName ? (
                      <Badge variant="secondary" className="text-xs">
                        {user.sbuName}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">No SBU</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatFullDate(user.createdAt)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.lastSignIn)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatFullDate(user.lastSignIn)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onResetPassword(user)}
                        className="h-8 px-2 text-xs"
                      >
                        Reset Password
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDelete(user)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default UserList;
