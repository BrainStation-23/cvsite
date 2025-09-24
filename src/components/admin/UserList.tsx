import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Loader2, 
  Edit, 
  Trash, 
  ChevronDown, 
  ChevronRight,
  User,
  Building,
  Crown,
  Calendar,
  Clock,
  Briefcase,
  Target
} from 'lucide-react';
import { UserData } from '@/hooks/use-user-management';
import { formatDistanceToNow, differenceInYears } from 'date-fns';

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
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

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
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate years of experience and years in company
  const calculateYears = (startDate?: string | null) => {
    if (!startDate) return null;
    try {
      return differenceInYears(new Date(), new Date(startDate));
    } catch (error) {
      return null;
    }
  };

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No users found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {users.map((user) => {
          const isExpanded = expandedUsers.has(user.id);
          const experienceYears = calculateYears(user.careerStartDate);
          const companyYears = calculateYears(user.dateOfJoining);

          return (
            <Card key={user.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                {/* Main Row - Always Visible */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Toggle Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(user.id)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {/* User Basic Info */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {user.employeeId && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {user.employeeId}
                        </Badge>
                      )}

                      <Badge variant={getRoleBadgeVariant(user.customRoleName || 'employee')}>
                        <Crown className="h-3 w-3 mr-1" />
                        {user.customRoleName || 'No Role'}
                      </Badge>

                      {user.sbuName && (
                        <Badge variant="secondary" className="text-xs">
                          <Building className="h-3 w-3 mr-1" />
                          {user.sbuName}
                        </Badge>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                      {experienceYears !== null && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{experienceYears}y exp</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Years of experience</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {companyYears !== null && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span>{companyYears}y here</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Years in company</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(user.lastSignIn)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Last login: {formatFullDate(user.lastSignIn)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
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
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Professional Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          Professional
                        </h4>
                        <div className="space-y-1 text-sm">
                          {user.expertiseName && (
                            <div>
                              <span className="text-muted-foreground">Expertise:</span>
                              <span className="ml-2">{user.expertiseName}</span>
                            </div>
                          )}
                          {user.resourceTypeName && (
                            <div>
                              <span className="text-muted-foreground">Resource Type:</span>
                              <span className="ml-2">{user.resourceTypeName}</span>
                            </div>
                          )}
                          {user.managerName && (
                            <div>
                              <span className="text-muted-foreground">Manager:</span>
                              <span className="ml-2">{user.managerName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Experience & Tenure */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Experience & Tenure
                        </h4>
                        <div className="space-y-1 text-sm">
                          {experienceYears !== null && (
                            <div>
                              <span className="text-muted-foreground">Total Experience:</span>
                              <span className="ml-2 font-medium">{experienceYears} years</span>
                            </div>
                          )}
                          {companyYears !== null && (
                            <div>
                              <span className="text-muted-foreground">Years in Company:</span>
                              <span className="ml-2 font-medium">{companyYears} years</span>
                            </div>
                          )}
                          {user.dateOfJoining && (
                            <div>
                              <span className="text-muted-foreground">Joined:</span>
                              <span className="ml-2">{formatFullDate(user.dateOfJoining)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Account Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Account
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Last Login:</span>
                            <span className="ml-2">{formatDate(user.lastSignIn)}</span>
                          </div>
                          {user.lastSignIn && (
                            <div className="text-xs text-muted-foreground">
                              {formatFullDate(user.lastSignIn)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default UserList;