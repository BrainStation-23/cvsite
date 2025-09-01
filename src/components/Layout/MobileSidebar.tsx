
import React from 'react';
import { Sheet, SheetContent, SheetOverlay } from '@/components/ui/sheet';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center px-6">
            <span className="text-lg font-semibold">Dashboard</span>
          </div>
          <div className="flex-1 px-6 pb-4">
            <nav className="flex flex-1 flex-col">
              {/* Navigation items would go here */}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
