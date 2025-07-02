import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const ProjectsManagement: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Projects Management</h1>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">Projects management interface will be implemented here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectsManagement;