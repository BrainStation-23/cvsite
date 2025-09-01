import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, className = "" }) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Sidebar closeMobileSidebar={closeMobileSidebar} />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
