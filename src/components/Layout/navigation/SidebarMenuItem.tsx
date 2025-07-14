
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationItem } from './navigationData';

interface SidebarMenuItemProps {
  item: NavigationItem;
  isSidebarOpen: boolean;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item, isSidebarOpen }) => {
  const location = useLocation();
  const IconComponent = item.icon;

  if (item.hasSubmenu) {
    return (
      <>
        <div className="flex items-center">
          <Link
            to={item.to}
            className="flex items-center px-4 py-2.5 hover:bg-teal-900/40 transition-colors rounded-lg group flex-1"
          >
            <IconComponent className="w-5 h-5 text-teal-400 group-hover:text-teal-200" />
            {isSidebarOpen && <span className="ml-3 group-hover:text-white">{item.label}</span>}
          </Link>
          {isSidebarOpen && (
            <button
              onClick={item.onToggle}
              className="p-1 hover:bg-teal-900/40 rounded transition-colors mr-2"
            >
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-teal-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-teal-400" />
              )}
            </button>
          )}
        </div>
        {/* Submenu */}
        {item.isExpanded && isSidebarOpen && (
          <ul className="ml-4 mt-1">
            {item.submenuItems?.map((subItem) => {
              const SubIconComponent = subItem.icon;
              return (
                <li key={subItem.to} className="mb-1">
                  <Link
                    to={subItem.to}
                    className={`flex items-center px-4 py-2 hover:bg-teal-900/40 transition-colors rounded-lg group text-sm ${
                      location.pathname === subItem.to ? 'bg-teal-900/60 text-teal-200' : ''
                    }`}
                  >
                    <SubIconComponent className="w-4 h-4 text-teal-400 group-hover:text-teal-200" />
                    <span className="ml-3 group-hover:text-white">{subItem.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  }

  return (
    <Link
      to={item.to}
      className="flex items-center px-4 py-2.5 hover:bg-teal-900/40 transition-colors rounded-lg group"
    >
      <IconComponent className="w-5 h-5 text-teal-400 group-hover:text-teal-200" />
      {isSidebarOpen && <span className="ml-3 group-hover:text-white">{item.label}</span>}
    </Link>
  );
};

export default SidebarMenuItem;
