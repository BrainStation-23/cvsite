import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award ,Download} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { NonBilledRecord } from './types/non-billed-record-data';
import { NonBilledFeedbackCell } from './NonBilledFeedbackCell';
import { useNonBilledFeedback } from '@/hooks/use-non-billed-feedback';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';


interface NonBilledTableRowProps {
  record: NonBilledRecord;
  onPDFExport: (profileId: string, employeeName: string) => void;
}

export const NonBilledTableRow: React.FC<NonBilledTableRowProps> = ({ record, onPDFExport }) => {
  const { updateFeedback } = useNonBilledFeedback();
  const formatBenchDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDurationBadge = (days: number) => {
    if (days <= 7) {
      return <Badge className="bg-green-100 text-green-800">{days}d</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">{days}d</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{days}d</Badge>;
    }
  };

  const getExperienceBadge = (years: number) => {
    if (years < 2) {
      return <Badge variant="outline" className="text-blue-600">Junior</Badge>;
    } else if (years < 5) {
      return <Badge variant="outline" className="text-green-600">Mid-level</Badge>;
    } else {
      return <Badge variant="outline" className="text-purple-600">Senior</Badge>;
    }
  };

  // Construct employee name (adjust fields as needed)
  const employeeName = `${record.employee_name || ''}`.trim();

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{record.employee_name}</span>
            <span className="text-xs text-muted-foreground">#{record.employee_id}</span>
          </div>
          {record.expertise && (
            <div>
              <Badge variant="outline" className="text-xs">
                {record.expertise}
              </Badge>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ 
              backgroundColor: record.bill_type_color,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
            }}
            title={`Bill Type: ${record.bill_type_name}`}
          />
          <span className="text-sm font-medium" style={{ color: record.bill_type_color }}>
            {record.bill_type_name}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatBenchDate(record.non_billed_resources_date)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{record.sbu_name}</Badge>
      </TableCell>
      <TableCell>
        <Badge 
          variant={record.planned_status === 'planned' ? 'secondary' : 'destructive'}
          className={record.planned_status === 'planned' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
        >
          {record.planned_status === 'planned' ? 'Planned' : 'Unplanned'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {getDurationBadge(record.non_billed_resources_duration_days)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm mr-2">{record.total_years_experience}y</span>
          {getExperienceBadge(record.total_years_experience)}
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <NonBilledFeedbackCell
          employeeId={record.employee_id}
          employeeName={record.employee_name}
          feedback={record.non_billed_resources_feedback}
          onUpdate={updateFeedback}
        />
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPDFExport(record.profile_id, employeeName)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export CV as PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
};