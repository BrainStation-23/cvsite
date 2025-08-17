
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
import { 
  Loader2
} from 'lucide-react';
import CompactEmployeeProfile from './compact-table/CompactEmployeeProfile';
import CompactSkillsDisplay from './compact-table/CompactSkillsDisplay';
import CompactTrainingSummary from './compact-table/CompactTrainingSummary';
import CompactResourcePlanning from './compact-table/CompactResourcePlanning';
import CompactEmployeeActions from './compact-table/CompactEmployeeActions';
import NotesDialog from './NotesDialog';
import PDFExportModal from './PDFExportModal';
import { 
  TooltipProvider
} from '@/components/ui/tooltip';

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

  const [pdfExportModalOpen, setPdfExportModalOpen] = useState(false);
  const [selectedEmployeeForPDF, setSelectedEmployeeForPDF] = useState<{
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

  const handlePDFExport = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const employeeName = `${profile.first_name || profile.general_information?.first_name || 'N/A'} ${profile.last_name || profile.general_information?.last_name || ''}`.trim();
    
    setSelectedEmployeeForPDF({
      id: profileId,
      name: employeeName
    });
    setPdfExportModalOpen(true);
  };

  const handleClosePDFExportModal = () => {
    setPdfExportModalOpen(false);
    setSelectedEmployeeForPDF(null);
  };

  if (isLoading && profiles.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cvsite-teal" />
      </div>
    );
  }

  return (
    <TooltipProvider>
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
            <TableHead className="min-w-[280px]">Employee Profile</TableHead>
            <TableHead className="min-w-[120px]">Skills & Expertise</TableHead>
            <TableHead className="min-w-[150px]">Certifications</TableHead>
            <TableHead className="min-w-[200px]">Resource Planning</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
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
                  <CompactEmployeeProfile 
                    profile={profile}
                    generalInfo={profile.general_information}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <CompactSkillsDisplay
                    technicalSkills={profile.technical_skills || []}
                    specializedSkills={profile.specialized_skills || []}
                  />
                </TableCell>
                <TableCell className="py-4 max-w-[300px]">
                  <CompactTrainingSummary
                    trainings={profile.trainings || []}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <CompactResourcePlanning
                    resourcePlanning={profile.resource_planning}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <CompactEmployeeActions
                    profile={profile}
                    onViewProfile={onViewProfile}
                    onSendEmail={onSendEmail}
                    onNotesClick={handleNotesClick}
                    onPDFExport={handlePDFExport}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
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

      {/* Notes Dialog */}
      {selectedProfileForNotes && (
        <NotesDialog
          isOpen={notesDialogOpen}
          onClose={handleCloseNotesDialog}
          profileId={selectedProfileForNotes.id}
          employeeName={selectedProfileForNotes.name}
        />
      )}

      {/* PDF Export Modal */}
      {selectedEmployeeForPDF && (
        <PDFExportModal
          isOpen={pdfExportModalOpen}
          onClose={handleClosePDFExportModal}
          employeeId={selectedEmployeeForPDF.id}
          employeeName={selectedEmployeeForPDF.name}
        />
      )}
    </TooltipProvider>
  );
};

export default CompactEmployeeTable;
