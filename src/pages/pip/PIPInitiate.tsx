
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX } from 'lucide-react';

const PIPInitiate: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <UserX className="h-8 w-8 text-cvsite-teal" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Initiate PIP
            </h1>
            <p className="text-muted-foreground">
              Start a Performance Improvement Plan for an employee
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PIP Initiation</CardTitle>
            <CardDescription>
              This page will allow administrators to initiate Performance Improvement Plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Placeholder content for PIP initiation functionality
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PIPInitiate;
