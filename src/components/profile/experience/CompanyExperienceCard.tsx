
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Position {
  id: string;
  designation: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  duration_months: number;
}

interface CompanyExperience {
  company_name: string;
  total_duration_months: number;
  positions: Position[];
  earliest_start_date: string;
  latest_end_date?: string;
  is_current_company: boolean;
}

interface CompanyExperienceCardProps {
  companyData: CompanyExperience;
  isEditing: boolean;
  formatDuration: (months: number) => string;
  onEditPosition?: (position: Position) => void;
  onDeletePosition?: (positionId: string) => void;
}

export const CompanyExperienceCard: React.FC<CompanyExperienceCardProps> = ({
  companyData,
  isEditing,
  formatDuration,
  onEditPosition,
  onDeletePosition
}) => {
  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = format(new Date(startDate), 'MMM yyyy');
    if (isCurrent) return `${start} - Present`;
    if (endDate) return `${start} - ${format(new Date(endDate), 'MMM yyyy')}`;
    return start;
  };

  const getTotalCompanyDateRange = () => {
    const start = format(new Date(companyData.earliest_start_date), 'MMM yyyy');
    if (companyData.is_current_company) return `${start} - Present`;
    if (companyData.latest_end_date) {
      return `${start} - ${format(new Date(companyData.latest_end_date), 'MMM yyyy')}`;
    }
    return start;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        {/* Company Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Building2 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {companyData.company_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <CalendarDays className="h-4 w-4" />
              <span>{getTotalCompanyDateRange()}</span>
              <span>•</span>
              <span>{formatDuration(companyData.total_duration_months)}</span>
            </div>
          </div>
        </div>

        {/* Positions */}
        <div className="space-y-4">
          {companyData.positions.map((position, index) => (
            <div 
              key={position.id} 
              className={`${index > 0 ? 'border-t pt-4' : ''} ${index < companyData.positions.length - 1 ? 'border-b pb-4' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {position.designation}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDateRange(position.start_date, position.end_date, position.is_current)} • {formatDuration(position.duration_months)}
                  </div>
                  {position.description && (
                    <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {position.description}
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPosition?.(position)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeletePosition?.(position.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
