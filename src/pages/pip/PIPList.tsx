
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { List } from 'lucide-react';
import { PIPListTable } from '@/components/pip/PIPListTable';

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

        <PIPListTable />
      </div>
    </DashboardLayout>
  );
};

export default PIPList;
