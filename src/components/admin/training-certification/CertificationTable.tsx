
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Award } from 'lucide-react';
import { CertificationRecord } from '@/hooks/use-certifications-search';

interface CertificationTableProps {
  certifications: CertificationRecord[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

export const CertificationTable: React.FC<CertificationTableProps> = ({
  certifications,
  sortBy,
  sortOrder,
  onSort
}) => {
  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('first_name')}
            >
              Employee {getSortIcon('first_name')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('employee_id')}
            >
              Employee ID {getSortIcon('employee_id')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('sbu_name')}
            >
              SBU {getSortIcon('sbu_name')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('title')}
            >
              Certification {getSortIcon('title')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('provider')}
            >
              Provider {getSortIcon('provider')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('certification_date')}
            >
              Date {getSortIcon('certification_date')}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No certifications found
              </TableCell>
            </TableRow>
          ) : (
            certifications.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>
                  <div className="font-medium">
                    {cert.first_name} {cert.last_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{cert.employee_id}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{cert.sbu_name || 'N/A'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <div className="font-medium truncate" title={cert.title}>
                      {cert.title}
                    </div>
                    {cert.description && (
                      <div className="text-sm text-gray-500 truncate" title={cert.description}>
                        {cert.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{cert.provider}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {format(new Date(cert.certification_date), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="default" className="w-fit">
                      <Award className="h-3 w-3 mr-1" />
                      Certified
                    </Badge>
                    {cert.expiry_date && (
                      <div className="text-xs text-gray-500">
                        Expires: {format(new Date(cert.expiry_date), 'MMM yyyy')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {cert.certificate_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={cert.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
