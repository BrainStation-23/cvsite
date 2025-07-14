
import React from 'react';
import { Bell } from 'lucide-react';

interface User {
  firstName: string;
  lastName: string;
}

interface DashboardHeaderProps {
  pageTitle: string;
  user: User | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ pageTitle, user }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm py-3 px-6 flex-shrink-0">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          {pageTitle}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {user?.firstName} {user?.lastName}
            </span>
            <div className="w-9 h-9 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
