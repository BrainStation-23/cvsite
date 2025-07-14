
import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';
import { NavigationGroup } from './navigationData';

interface SidebarNavigationProps {
  sidebarGroups: NavigationGroup[];
  isSidebarOpen: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ sidebarGroups, isSidebarOpen }) => {
  return (
    <nav className="mt-5">
      {sidebarGroups.map((group, groupIdx) => (
        <div key={group.label || groupIdx} className="mb-4">
          {group.label && isSidebarOpen && (
            <div className="px-4 py-2.5 text-sm font-bold bg-slate-800/70 text-teal-300 uppercase tracking-wider border-b border-slate-700">
              {group.label}
            </div>
          )}
          <ul>
            {group.items.map((item) => (
              <li key={item.to} className="mb-1.5 mx-2">
                <SidebarMenuItem item={item} isSidebarOpen={isSidebarOpen} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
