
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Dashboard content coming soon...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
