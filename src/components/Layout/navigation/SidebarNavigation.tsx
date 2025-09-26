
import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';
import { NavigationGroup } from './navigationData';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarNavigationProps {
  sidebarGroups: NavigationGroup[];
  isSidebarOpen: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ sidebarGroups, isSidebarOpen }) => {
  const { hasModuleAccess, hasSubModulePermission } = useAuth();

  // Filter navigation groups to only show groups with accessible items
  const filteredGroups = sidebarGroups.map(group => {
    const allowedItems = group.items.filter(item => {
      // If no permissions specified, show the item (for core items like Dashboard, Profile)
      if (!item.requiredModuleAccess && !item.requiredSubModuleAccess) {
        return true;
      }

      // Check module access
      if (item.requiredModuleAccess && !hasModuleAccess(item.requiredModuleAccess)) {
        return false;
      }

      // Check sub-module permission
      if (item.requiredSubModuleAccess && item.requiredPermissionType) {
        return hasSubModulePermission(item.requiredSubModuleAccess, item.requiredPermissionType);
      }

      return true;
    });

    return {
      ...group,
      items: allowedItems
    };
  }).filter(group => group.items.length > 0); // Only show groups with allowed items

  return (
    <nav className="mt-5">
      {filteredGroups.map((group, groupIdx) => (
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
