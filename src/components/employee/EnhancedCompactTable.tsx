
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import EnhancedEmployeeProfile from './compact-table/EnhancedEmployeeProfile';
import EnhancedSkillsDisplay from './compact-table/EnhancedSkillsDisplay';
import CompactTrainingSummary from './compact-table/CompactTrainingSummary';
import CompactActionButtons from './compact-table/CompactActionButtons';
import NotesDialog from './NotesDialog';
import type { EnhancedEmployeeProfile as EmployeeProfileType } from '@/types/employee';

interface EnhancedCompactTableProps {
  profiles: EmployeeProfileType[];
  isLoading: boolean;
  onViewProfile: (profileId: string) => void;
  onSendEmail: (profile: EmployeeProfileType) => void;
  selectedProfiles: string[];
  onProfileSelect: (profileId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
}

const EnhancedCompactTable: React.FC<EnhancedCompactTableProps> = ({
  profiles,
  isLoading,
  onViewProfile,
  onSendEmail,
  selectedProfiles,
  onProfileSelect,
  onSelectAll,
  isAllSelected
}) => {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedProfileForNotes, setSelectedProfileForNotes] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleNotesClick = (profile: EmployeeProfileType) => {
    const firstName = profile.general_information?.first_name || profile.first_name || '';
    const lastName = profile.general_information?.last_name || profile.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
    
    setSelectedProfileForNotes({
      id: profile.id,
      name: fullName
    });
    setNotesDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setNotesDialogOpen(false);
    setSelectedProfileForNotes(null);
  };

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
    <>
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
              <TableHead className="min-w-[280px]">Employee Profile</TableHead>
              <TableHead className="min-w-[240px]">Skills & Expertise</TableHead>
              <TableHead className="min-w-[220px]">Training & Certifications</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={() => onProfileSelect(profile.id)}
                    aria-label={`Select ${profile.first_name} ${profile.last_name}`}
                  />
                </TableCell>
                
                <TableCell>
                  <EnhancedEmployeeProfile profile={profile} />
                </TableCell>
                
                <TableCell>
                  <EnhancedSkillsDisplay 
                    technicalSkills={profile.technical_skills}
                    specializedSkills={profile.specialized_skills}
                  />
                </TableCell>
                
                <TableCell>
                  <CompactTrainingSummary trainings={profile.trainings} />
                </TableCell>
                
                <TableCell>
                  <CompactActionButtons
                    profile={profile}
                    onViewProfile={onViewProfile}
                    onSendEmail={onSendEmail}
                    onNotesClick={handleNotesClick}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Notes Dialog */}
      {selectedProfileForNotes && (
        <NotesDialog
          isOpen={notesDialogOpen}
          onClose={handleCloseNotesDialog}
          profileId={selectedProfileForNotes.id}
          employeeName={selectedProfileForNotes.name}
        />
      )}
    </>
  );
};

export default EnhancedCompactTable;
