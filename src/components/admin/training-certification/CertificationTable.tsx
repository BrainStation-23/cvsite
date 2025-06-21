
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Award, ArrowUpDown } from 'lucide-react';
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
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No certifications found</h3>
        <p className="text-sm">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 transition-colors px-4 py-3"
              onClick={() => handleSort('first_name')}
            >
              <div className="flex items-center gap-1 font-medium">
                Employee
                {getSortIcon('first_name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 transition-colors px-4 py-3"
              onClick={() => handleSort('employee_id')}
            >
              <div className="flex items-center gap-1 font-medium">
                ID
                {getSortIcon('employee_id')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 transition-colors px-4 py-3"
              onClick={() => handleSort('sbu_name')}
            >
              <div className="flex items-center gap-1 font-medium">
                SBU
                {getSortIcon('sbu_name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 transition-colors px-4 py-3"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-1 font-medium">
                Certification
                {getSortIcon('title')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 transition-colors px-4 py-3"
              onClick={() => handleSort('provider')}
            >
              <div className="flex items-center gap-1 font-medium">
                Provider
                {getSortIcon('provider')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100 transition-colors px-4 py-3"
              onClick={() => handleSort('certification_date')}
            >
              <div className="flex items-center gap-1 font-medium">
                Date
                {getSortIcon('certification_date')}
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 font-medium">Status</TableHead>
            <TableHead className="px-4 py-3 font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.map((cert, index) => (
            <TableRow key={cert.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
              <TableCell className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {cert.first_name} {cert.last_name}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant="secondary" className="text-xs">
                  {cert.employee_id}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant="outline" className="text-xs">
                  {cert.sbu_name || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="max-w-xs">
                  <div className="font-medium text-gray-900 truncate" title={cert.title}>
                    {cert.title}
                  </div>
                  {cert.description && (
                    <div className="text-xs text-gray-500 truncate mt-1" title={cert.description}>
                      {cert.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <span className="text-sm font-medium text-gray-700">
                  {cert.provider}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(cert.certification_date), 'MMM d, yyyy')}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="space-y-1">
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
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
              <TableCell className="px-4 py-3">
                {cert.certificate_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
