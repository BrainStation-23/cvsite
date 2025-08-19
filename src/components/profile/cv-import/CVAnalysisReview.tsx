
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Eye, Edit3, CheckCircle, AlertTriangle } from 'lucide-react';
import { CVProcessResult } from '@/hooks/use-cv-import';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';

interface CVAnalysisReviewProps {
  analysisResult: CVProcessResult;
  onImport: (profileData: ProfileJSONData) => void;
  onEdit: () => void;
  isImporting?: boolean;
}

export const CVAnalysisReview: React.FC<CVAnalysisReviewProps> = ({
  analysisResult,
  onImport,
  onEdit,
  isImporting = false
}) => {
  const [editedData, setEditedData] = useState<ProfileJSONData>(analysisResult.profileData);

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[confidence as keyof typeof variants] || variants.medium}>
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
      </Badge>
    );
  };

  const getDataSummary = () => {
    const data = editedData;
    return {
      'General Info': data.generalInfo.firstName && data.generalInfo.lastName ? 1 : 0,
      'Technical Skills': data.technicalSkills.length,
      'Specialized Skills': data.specializedSkills.length,
      'Experiences': data.experiences.length,
      'Education': data.education.length,
      'Trainings': data.trainings.length,
      'Achievements': data.achievements.length,
      'Projects': data.projects.length,
    };
  };

  const renderDataSection = (title: string, data: any[], renderItem: (item: any, index: number) => React.ReactNode) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {title} ({data.length})
      </h4>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} extracted</p>
      ) : (
        <div className="space-y-2">
          {data.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  );

  const summary = getDataSummary();

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Analysis Results
            </div>
            {getConfidenceBadge(analysisResult.confidence)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary).map(([section, count]) => (
              <div key={section} className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-xs text-muted-foreground">{section}</div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => onImport(editedData)}
              disabled={isImporting}
              className="flex-1"
            >
              {isImporting ? (
                <>Loading...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import Profile Data
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onEdit}
              disabled={isImporting}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Data</TabsTrigger>
          <TabsTrigger value="raw">File Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* General Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">General Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Name:</strong> {editedData.generalInfo.firstName} {editedData.generalInfo.lastName}</div>
                  <div><strong>Designation:</strong> {editedData.generalInfo.current_designation || 'Not specified'}</div>
                  <div className="col-span-2"><strong>Biography:</strong> {editedData.generalInfo.biography || 'Not provided'}</div>
                </div>
              </div>

              {/* Skills Summary */}
              {(editedData.technicalSkills.length > 0 || editedData.specializedSkills.length > 0) && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Skills Summary</h4>
                  <div className="space-y-2">
                    {editedData.technicalSkills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Technical: </span>
                        <span className="text-sm text-muted-foreground">
                          {editedData.technicalSkills.map(s => s.name).join(', ')}
                        </span>
                      </div>
                    )}
                    {editedData.specializedSkills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Specialized: </span>
                        <span className="text-sm text-muted-foreground">
                          {editedData.specializedSkills.map(s => s.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Experience Summary */}
              {editedData.experiences.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Experience Highlights</h4>
                  {editedData.experiences.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="text-sm mb-1">
                      <strong>{exp.designation}</strong> at {exp.companyName}
                      {exp.startDate && (
                        <span className="text-muted-foreground"> ({exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate})</span>
                      )}
                    </div>
                  ))}
                  {editedData.experiences.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{editedData.experiences.length - 3} more experiences
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {/* Technical Skills */}
              {renderDataSection('Technical Skills', editedData.technicalSkills, (skill, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{skill.name}</span>
                  <Badge variant="secondary">Level {skill.proficiency}</Badge>
                </div>
              ))}

              {/* Experiences */}
              {renderDataSection('Experiences', editedData.experiences, (exp, idx) => (
                <div key={idx} className="p-3 border rounded">
                  <div className="font-medium">{exp.designation} at {exp.companyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || 'Not specified'}
                  </div>
                  {exp.description && (
                    <div className="text-sm mt-1">{exp.description}</div>
                  )}
                </div>
              ))}

              {/* Education */}
              {renderDataSection('Education', editedData.education, (edu, idx) => (
                <div key={idx} className="p-3 border rounded">
                  <div className="font-medium">{edu.degree} in {edu.department}</div>
                  <div className="text-sm text-muted-foreground">{edu.university}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate || 'Not specified'}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </div>
                </div>
              ))}

              {/* Projects */}
              {renderDataSection('Projects', editedData.projects, (project, idx) => (
                <div key={idx} className="p-3 border rounded">
                  <div className="font-medium">{project.name}</div>
                  {project.role && <div className="text-sm text-muted-foreground">Role: {project.role}</div>}
                  <div className="text-sm mt-1">{project.description}</div>
                  {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologiesUsed.map((tech, techIdx) => (
                        <Badge key={techIdx} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>File Name:</strong> {analysisResult.fileName}</div>
                <div><strong>File Size:</strong> {Math.round(analysisResult.fileSize / 1024)} KB</div>
                <div><strong>File Type:</strong> {analysisResult.fileType}</div>
                {analysisResult.fileUri && (
                  <div><strong>File URI:</strong> {analysisResult.fileUri}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
