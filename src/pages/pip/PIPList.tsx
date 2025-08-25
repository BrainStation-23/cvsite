
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';

const PIPList: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <List className="h-8 w-8 text-cvsite-teal" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              PIP List
            </h1>
            <p className="text-muted-foreground">
              View and manage all Performance Improvement Plans
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active PIP Cases</CardTitle>
            <CardDescription>
              This page will display a list of all PIP cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Placeholder content for PIP list functionality
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PIPList;
