
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Loader2, 
  Calendar, 
  TrendingUp, 
  Building2,
  Clock
} from 'lucide-react';
import CompactEmployeeProfile from './compact-table/CompactEmployeeProfile';
import CompactSkillsDisplay from './compact-table/CompactSkillsDisplay';
import CompactTrainingSummary from './compact-table/CompactTrainingSummary';
import CompactEmployeeActions from './compact-table/CompactEmployeeActions';
import NotesDialog from './NotesDialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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

  const getAvailabilityBadge = (resourcePlanning?: any) => {
    const status = resourcePlanning?.availability_status || 'available';
    const variant = status === 'available' ? 'default' : status === 'engaged' ? 'secondary' : 'outline';
    const color = status === 'available' ? 'text-green-700 bg-green-50 border-green-200' : 
                  status === 'engaged' ? 'text-orange-700 bg-orange-50 border-orange-200' : 
                  'text-gray-700 bg-gray-50 border-gray-200';
    
    return (
      <Badge variant={variant} className={`${color} text-xs`}>
        {status === 'available' ? 'Available' : status === 'engaged' ? 'Engaged' : 'Unknown'}
      </Badge>
    );
  };

  const formatReleaseDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
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
            <TableHead className="min-w-[300px]">Skills & Expertise</TableHead>
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
                <TableCell className="py-4 max-w-[380px]">
                  <CompactTrainingSummary
                    trainings={profile.trainings || []}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-2">
                    {/* Availability Status */}
                    <div className="flex items-center gap-2">
                      {getAvailabilityBadge(profile.resource_planning)}
                    </div>
                    
                    {/* Current Project */}
                    {profile.resource_planning?.current_project && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="h-3 w-3 text-blue-600" />
                            <span className="truncate max-w-[150px]">
                              {profile.resource_planning.current_project.project_name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-medium">{profile.resource_planning.current_project.project_name}</div>
                            {profile.resource_planning.current_project.client_name && (
                              <div className="text-xs text-gray-600">Client: {profile.resource_planning.current_project.client_name}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {/* Engagement & Billing Percentages */}
                    {profile.resource_planning?.engagement_percentage && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          Eng: {profile.resource_planning.engagement_percentage}%
                          {profile.resource_planning.billing_percentage && (
                            ` | Bill: ${profile.resource_planning.billing_percentage}%`
                          )}
                        </span>
                      </div>
                    )}
                    
                    {/* Release Date */}
                    {profile.resource_planning?.release_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Release: {formatReleaseDate(profile.resource_planning.release_date)}</span>
                      </div>
                    )}
                    
                    {/* Days Until Available */}
                    {profile.resource_planning?.days_until_available > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Clock className="h-3 w-3" />
                        <span>{profile.resource_planning.days_until_available} days until available</span>
                      </div>
                    )}
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
    </TooltipProvider>
  );
};

export default CompactEmployeeTable;
