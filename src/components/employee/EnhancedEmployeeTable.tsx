
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, User, Mail, Loader2, MessageSquare } from 'lucide-react';
import NotesDialog from './NotesDialog';

interface EnhancedEmployeeTableProps {
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

const EnhancedEmployeeTable: React.FC<EnhancedEmployeeTableProps> = ({
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

  const getSkillsSummary = (technicalSkills: any[], specializedSkills: any[]) => {
    const allSkills = [...(technicalSkills || []), ...(specializedSkills || [])];
    if (allSkills.length === 0) return 'No skills listed';
    if (allSkills.length <= 3) {
      return allSkills.map(skill => skill.name).join(', ');
    }
    return `${allSkills.slice(0, 3).map(skill => skill.name).join(', ')} +${allSkills.length - 3} more`;
  };

  const getCurrentExperience = (experiences: any[]) => {
    if (!experiences || experiences.length === 0) return 'No experience listed';
    const current = experiences.find(exp => exp.is_current);
    if (current) return `${current.designation} at ${current.company_name}`;
    const latest = experiences[0];
    return `${latest.designation} at ${latest.company_name}`;
  };

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
            <TableHead>Employee</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Current Experience</TableHead>
            <TableHead>Skills Summary</TableHead>
            <TableHead>Education</TableHead>
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
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.profile_image} alt={`${profile.first_name} ${profile.last_name}`} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {profile.first_name || 'N/A'} {profile.last_name || ''}
                      </div>
                      {profile.biography && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-gray-500 truncate max-w-[200px] cursor-help">
                              {profile.biography}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[300px]">{profile.biography}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {profile.employee_id || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {getCurrentExperience(profile.experiences || [])}
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm text-gray-600 dark:text-gray-400 cursor-help">
                        {getSkillsSummary(profile.technical_skills || [], profile.specialized_skills || [])}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2 max-w-[300px]">
                        {profile.technical_skills && profile.technical_skills.length > 0 && (
                          <div>
                            <div className="font-medium">Technical Skills:</div>
                            <div className="text-sm">
                              {profile.technical_skills.map(skill => skill.name).join(', ')}
                            </div>
                          </div>
                        )}
                        {profile.specialized_skills && profile.specialized_skills.length > 0 && (
                          <div>
                            <div className="font-medium">Specialized Skills:</div>
                            <div className="text-sm">
                              {profile.specialized_skills.map(skill => skill.name).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {profile.education && profile.education.length > 0 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            {profile.education[0].degree || 'Degree'} from {profile.education[0].university}
                            {profile.education.length > 1 && (
                              <span className="text-gray-500"> +{profile.education.length - 1} more</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 max-w-[300px]">
                            {profile.education.map((edu, index) => (
                              <div key={index} className="text-sm">
                                {edu.degree || 'Degree'} from {edu.university}
                                {edu.department && ` (${edu.department})`}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      'No education listed'
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleNotesClick(profile)}
                          className="h-8 px-3"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View/Add Notes</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onSendEmail(profile)}
                          className="h-8 px-3"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send profile completion email</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewProfile(profile.id)}
                      className="h-8 px-3"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
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

export default EnhancedEmployeeTable;
