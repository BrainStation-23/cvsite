import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { BenchRecord } from './types/benchRecord';
import { BenchFeedbackCell } from './BenchFeedbackCell';
import { useBenchFeedback } from '@/hooks/use-bench-feedback';


interface BenchTableRowProps {
  record: BenchRecord;
}

export const BenchTableRow: React.FC<BenchTableRowProps> = ({ record }) => {
  const navigate = useNavigate();
  const { updateFeedback } = useBenchFeedback();
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
          <span className="text-sm">{formatBenchDate(record.bench_date)}</span>
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
          {getDurationBadge(record.bench_duration_days)}
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
        <BenchFeedbackCell
          employeeId={record.employee_id}
          employeeName={record.employee_name}
          feedback={record.bench_feedback}
          onUpdate={updateFeedback}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => navigate(`/employee/profile/${record.profile_id}`)}
          title="View Profile"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};