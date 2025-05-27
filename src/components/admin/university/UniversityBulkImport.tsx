
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { UniversityFormData } from '@/hooks/use-university-settings';

interface UniversityBulkImportProps {
  universities: UniversityFormData[];
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

const UniversityBulkImport: React.FC<UniversityBulkImportProps> = ({
  universities,
  onConfirm,
  onCancel,
  isImporting
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Import Preview ({universities.length} universities)</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-y-auto mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Acronyms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.map((university, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{university.name}</TableCell>
                  <TableCell>
                    <Badge variant={university.type === 'Public' ? 'default' : 'secondary'}>
                      {university.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{university.acronyms || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isImporting}>
            <Check className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : `Import ${universities.length} Universities`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UniversityBulkImport;
