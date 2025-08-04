
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, Mail, User, Loader2, Star } from 'lucide-react';
import { SearchResult } from '@/hooks/use-unified-search';

interface SimpleEmployeeTableProps {
  profiles: SearchResult[];
  isLoading: boolean;
  onViewProfile: (profileId: string) => void;
  onSendEmail: (profile: SearchResult) => void;
  selectedProfiles: string[];
  onProfileSelect: (profileId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  showSearchRank?: boolean;
}

const SimpleEmployeeTable: React.FC<SimpleEmployeeTableProps> = ({
  profiles,
  isLoading,
  onViewProfile,
  onSendEmail,
  selectedProfiles,
  onProfileSelect,
  onSelectAll,
  onClearSelection,
  isAllSelected,
  showSearchRank = false
}) => {
  if (isLoading && profiles.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectAll();
                } else {
                  onClearSelection();
                }
              }}
            />
          </TableHead>
          {showSearchRank && (
            <TableHead className="w-16">Rank</TableHead>
          )}
          <TableHead>Employee</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Experience</TableHead>
          <TableHead>SBU</TableHead>
          <TableHead>Availability</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProfiles.includes(profile.id)}
                  onCheckedChange={() => onProfileSelect(profile.id)}
                />
              </TableCell>
              
              {showSearchRank && (
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    <span className="text-xs font-mono">
                      {profile.search_rank > 0 ? profile.search_rank.toFixed(3) : '-'}
                    </span>
                  </div>
                </TableCell>
              )}
              
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {profile.employee_id || 'N/A'}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {profile.current_designation || 'Not specified'}
                </div>
                {profile.resource_type && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {profile.resource_type}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                <div className="text-sm font-medium">
                  {profile.total_experience_years > 0 
                    ? `${profile.total_experience_years} years`
                    : 'No experience listed'
                  }
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {profile.sbu_name || 'No SBU'}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {profile.engagement_percentage !== null && (
                    <div className="text-xs">
                      Engagement: {profile.engagement_percentage}%
                    </div>
                  )}
                  {profile.current_project && (
                    <div className="text-xs text-gray-600">
                      Project: {profile.current_project}
                    </div>
                  )}
                  {profile.release_date && (
                    <div className="text-xs text-gray-500">
                      Release: {new Date(profile.release_date).toLocaleDateString()}
                    </div>
                  )}
                  {!profile.engagement_percentage && !profile.current_project && (
                    <Badge variant="outline" className="text-xs">
                      Available
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSendEmail(profile)}
                    className="h-8 px-3"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewProfile(profile.id)}
                    className="h-8 px-3"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={showSearchRank ? 8 : 7} className="text-center py-8">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  Searching employees...
                </div>
              ) : (
                <div className="text-gray-500">
                  No employees found. Try adjusting your search terms or filters.
                </div>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default SimpleEmployeeTable;
