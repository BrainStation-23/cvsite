
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  closeMobileSidebar: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ closeMobileSidebar, className }) => {
  return (
    <aside className={cn(
      "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col",
      className
    )}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background border-r px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <span className="text-lg font-semibold">Dashboard</span>
        </div>
        <nav className="flex flex-1 flex-col">
          {/* Navigation items would go here */}
        </nav>
      </div>
    </aside>
  );
};
