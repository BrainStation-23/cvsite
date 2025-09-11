import React from 'react';
import { BenchSettings } from '@/pages/bench/BenchSettings';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const BenchSettingsPage: React.FC = () => {

  
  return (
    <DashboardLayout>
      <BenchSettings />
    </DashboardLayout>
  );
};

export default BenchSettingsPage;
