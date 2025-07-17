
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CompactSkillsSummary from './compact-table/CompactSkillsSummary';
import CompactTrainingSummary from './compact-table/CompactTrainingSummary';
import type { EnhancedEmployeeProfile } from '@/types/employee';

interface CompactEmployeeTableProps {
  profiles: EnhancedEmployeeProfile[];
  isLoading: boolean;
  onViewProfile: (profileId: string) => void;
  onSendEmail: (profile: EnhancedEmployeeProfile) => void;
  selectedProfiles: string[];
  onProfileSelect: (profileId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
}

const CompactEmployeeTable: React.FC<CompactEmployeeTableProps> = ({
  profiles,
  isLoading,
  onViewProfile,
  onSendEmail,
  selectedProfiles,
  onProfileSelect,
  onSelectAll,
  isAllSelected
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No employee profiles found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="min-w-[120px]">Employee ID</TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="min-w-[180px]">Email</TableHead>
            <TableHead className="min-w-[150px]">Designation</TableHead>
            <TableHead className="min-w-[200px]">Technical Skills</TableHead>
            <TableHead className="min-w-[200px]">Specialized Skills</TableHead>
            <TableHead className="min-w-[180px]">Certifications</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => {
            const displayName = profile.general_information?.first_name && profile.general_information?.last_name
              ? `${profile.general_information.first_name} ${profile.general_information.last_name}`
              : profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : 'N/A';

            const currentDesignation = profile.general_information?.current_designation || 'N/A';
            const email = profile.email || 'N/A';

            return (
              <TableRow key={profile.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={() => onProfileSelect(profile.id)}
                    aria-label={`Select ${displayName}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {profile.employee_id || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {profile.general_information?.profile_image && (
                      <img
                        src={profile.general_information.profile_image}
                        alt={displayName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{displayName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {email}
                </TableCell>
                <TableCell>
                  {currentDesignation !== 'N/A' ? (
                    <Badge variant="secondary" className="text-xs">
                      {currentDesignation}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <CompactSkillsSummary skills={profile.technical_skills} />
                </TableCell>
                <TableCell>
                  <CompactSkillsSummary skills={profile.specialized_skills} />
                </TableCell>
                <TableCell>
                  <CompactTrainingSummary trainings={profile.trainings} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(profile.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View profile</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSendEmail(profile)}
                      className="h-8 w-8 p-0"
                      disabled={!profile.email}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Send email</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompactEmployeeTable;
