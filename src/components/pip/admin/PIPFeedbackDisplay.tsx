
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

interface PIPFeedbackDisplayProps {
  overallFeedback: string | null;
  finalReview: string | null;
  pmFeedback: {
    id: string;
    skill_areas: string[];
    skill_gap_description: string | null;
    skill_gap_example: string | null;
    behavioral_areas: string[];
    behavioral_gap_description: string | null;
    behavioral_gap_example: string | null;
    created_at: string;
  } | null;
}

export const PIPFeedbackDisplay: React.FC<PIPFeedbackDisplayProps> = ({
  overallFeedback,
  finalReview,
  pmFeedback
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* HR Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            HR Overall Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overallFeedback ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: overallFeedback }}
            />
          ) : (
            <p className="text-muted-foreground italic">No overall feedback provided yet.</p>
          )}
        </CardContent>
      </Card>

      {/* PM Feedback */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Project Manager Feedback
            </CardTitle>
            {pmFeedback && (
              <Badge variant="secondary" className="text-xs">
                Submitted {formatDate(pmFeedback.created_at)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pmFeedback ? (
            <div className="space-y-6">
              {/* Skill Areas */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Technical Skills Areas for Improvement
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {pmFeedback.skill_areas.map((skill, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {pmFeedback.skill_gap_description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {pmFeedback.skill_gap_description}
                      </p>
                    </div>
                  )}
                  {pmFeedback.skill_gap_example && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Example:</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {pmFeedback.skill_gap_example}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Behavioral Areas */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Behavioral Areas for Improvement
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {pmFeedback.behavioral_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  {pmFeedback.behavioral_gap_description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {pmFeedback.behavioral_gap_description}
                      </p>
                    </div>
                  )}
                  {pmFeedback.behavioral_gap_example && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Example:</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {pmFeedback.behavioral_gap_example}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No project manager feedback available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Review */}
      {finalReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Final Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: finalReview }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
