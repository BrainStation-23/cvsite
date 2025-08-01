
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import CompactEmployeeProfile from './compact-table/CompactEmployeeProfile';
import CompactSkillsDisplay from './compact-table/CompactSkillsDisplay';
import CompactTrainingSummary from './compact-table/CompactTrainingSummary';
import CompactEmployeeActions from './compact-table/CompactEmployeeActions';
import NotesDialog from './NotesDialog';

interface CompactEmployeeTableProps {
  profiles: any[];
  isLoading: boolean;
  onViewProfile: (profileId: string) => void;
  onSendEmail: (profile: any) => void;
  selectedProfiles: string[];
  onProfileSelect: (profileId: string) => void;
  onSelectAll: () => void;
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
  onClearSelection,
  isAllSelected
}) => {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedProfileForNotes, setSelectedProfileForNotes] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleNotesClick = (profile: any) => {
    setSelectedProfileForNotes({
      id: profile.id,
      name: `${profile.first_name || 'N/A'} ${profile.last_name || ''}`.trim()
    });
    setNotesDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setNotesDialogOpen(false);
    setSelectedProfileForNotes(null);
  };

  if (isLoading && profiles.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cvsite-teal" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <Table className="w-full min-w-[800px]">
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
              <TableHead className="w-[25%]">Employee Profile</TableHead>
              <TableHead className="w-[35%]">Skills & Expertise</TableHead>
              <TableHead className="w-[25%]">Certifications</TableHead>
              <TableHead className="w-[15%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <TableRow key={profile.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedProfiles.includes(profile.id)}
                      onCheckedChange={() => onProfileSelect(profile.id)}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="min-w-0">
                      <CompactEmployeeProfile 
                        profile={profile}
                        generalInfo={profile.general_information}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="min-w-0">
                      <CompactSkillsDisplay
                        technicalSkills={profile.technical_skills || []}
                        specializedSkills={profile.specialized_skills || []}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="min-w-0">
                      <CompactTrainingSummary
                        trainings={profile.trainings || []}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <CompactEmployeeActions
                      profile={profile}
                      onViewProfile={onViewProfile}
                      onSendEmail={onSendEmail}
                      onNotesClick={handleNotesClick}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-cvsite-teal mr-2" />
                      Loading employee profiles...
                    </div>
                  ) : (
                    'No employee profiles found'
                  )}
                </TableCell>
              </TableRow>
            )}
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

export default CompactEmployeeTable;
