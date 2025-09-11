import React from 'react';
import { BenchReport } from '@/pages/bench/BenchReport';
import DashboardLayout from '@/components/Layout/DashboardLayout';


const BenchReportPage: React.FC = () => {
  
  return (
    <DashboardLayout>
      <BenchReport />
    </DashboardLayout>
  );
};

export default BenchReportPage;
