
import React from 'react';
import { UserX } from 'lucide-react';
import { PIPInitiationForm } from '@/components/pip/PIPInitiationForm';

const PIPInitiate: React.FC = () => {
  return (
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

      <PIPInitiationForm />
    </div>
  );
};

export default PIPInitiate;
