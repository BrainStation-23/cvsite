
import React from 'react';
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
import { Eye, User, Mail, Loader2, MessageSquare, Briefcase, Calendar, Percent } from 'lucide-react';
import { format } from 'date-fns';
import CompactSkillsSummary from './CompactSkillsSummary';
import CompactExperienceSummary from './CompactExperienceSummary';
import CompactTrainingSummary from './CompactTrainingSummary';
import CompactEducationSummary from './CompactEducationSummary';

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
  const getAvailabilityBadge = (resourcePlanning: any) => {
    if (!resourcePlanning) {
      return <Badge variant="secondary" className="text-green-700 bg-green-100">Available</Badge>;
    }

    const status = resourcePlanning.availability_status;
    if (status === 'available') {
      return <Badge variant="secondary" className="text-green-700 bg-green-100">Available</Badge>;
    } else if (status === 'engaged') {
      return <Badge variant="secondary" className="text-orange-700 bg-orange-100">Engaged</Badge>;
    }
    
    return <Badge variant="secondary" className="text-green-700 bg-green-100">Available</Badge>;
  };

  const getCurrentProject = (resourcePlanning: any) => {
    if (!resourcePlanning?.current_project) {
      return 'No current project';
    }
    
    return resourcePlanning.current_project.project_name;
  };

  const formatReleaseDate = (resourcePlanning: any) => {
    if (!resourcePlanning?.release_date) {
      return 'N/A';
    }
    
    return format(new Date(resourcePlanning.release_date), 'MMM dd, yyyy');
  };

  const getEngagementInfo = (resourcePlanning: any) => {
    if (!resourcePlanning) {
      return { engagement: 0, billing: 0 };
    }
    
    return {
      engagement: resourcePlanning.engagement_percentage || 0,
      billing: resourcePlanning.billing_percentage || 0
    };
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
      <div className="border rounded-lg">
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
              <TableHead className="min-w-[200px]">Employee</TableHead>
              <TableHead className="min-w-[120px]">Availability</TableHead>
              <TableHead className="min-w-[150px]">Current Project</TableHead>
              <TableHead className="min-w-[100px]">Engagement</TableHead>
              <TableHead className="min-w-[120px]">Release Date</TableHead>
              <TableHead className="min-w-[200px]">Skills</TableHead>
              <TableHead className="min-w-[180px]">Experience</TableHead>
              <TableHead className="min-w-[180px]">Education</TableHead>
              <TableHead className="max-w-[380px]">Training</TableHead>
              <TableHead className="text-right min-w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length > 0 ? (
              profiles.map((profile) => {
                const engagementInfo = getEngagementInfo(profile.resource_planning);
                
                return (
                  <TableRow key={profile.id} className="h-20">
                    <TableCell>
                      <Checkbox
                        checked={selectedProfiles.includes(profile.id)}
                        onCheckedChange={() => onProfileSelect(profile.id)}
                      />
                    </TableCell>
                    
                    <TableCell className="py-4">
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
                          <Badge variant="outline" className="font-mono text-xs mt-1">
                            {profile.employee_id || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      {getAvailabilityBadge(profile.resource_planning)}
                      {profile.resource_planning?.days_until_available > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {profile.resource_planning.days_until_available} days
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{getCurrentProject(profile.resource_planning)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-blue-600">{engagementInfo.engagement}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">{engagementInfo.billing}%</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatReleaseDate(profile.resource_planning)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 max-w-[200px]">
                      <CompactSkillsSummary
                        technicalSkills={profile.technical_skills || []}
                        specializedSkills={profile.specialized_skills || []}
                      />
                    </TableCell>
                    
                    <TableCell className="py-4 max-w-[180px]">
                      <CompactExperienceSummary
                        experiences={profile.experiences || []}
                      />
                    </TableCell>
                    
                    <TableCell className="py-4 max-w-[180px]">
                      <CompactEducationSummary
                        education={profile.education || []}
                      />
                    </TableCell>
                    
                    <TableCell className="py-4 max-w-[380px] ">
                      <CompactTrainingSummary
                        trainings={profile.trainings || []}
                      />
                    </TableCell>
                    
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSendEmail(profile)}
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
                            <p>Send email</p>
                          </TooltipContent>
                        </Tooltip>
                        
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
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
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
    </TooltipProvider>
  );
};

export default CompactEmployeeTable;
