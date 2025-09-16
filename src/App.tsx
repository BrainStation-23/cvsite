
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Callback from '@/pages/auth/Callback';
import FrontChannelLogout from './pages/auth/FrontChannelLogout';
import ProfilePage from '@/pages/profile/ProfilePage';
import EmployeeData from '@/pages/employee/EmployeeData';
import ViewProfilePage from '@/pages/employee/ViewProfilePage';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import EmployeeDashboard from '@/pages/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/pages/dashboard/ManagerDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import AddUser from '@/pages/admin/AddUser';
import EditUser from '@/pages/admin/EditUser';
import EmployeeDataManagement from './pages/admin/EmployeeDataManagement';
import ResourcePlanningSettings from '@/pages/admin/platform-settings/ResourcePlanningSettings';
import CVTemplateSettings from '@/pages/admin/platform-settings/CVTemplateSettings';
import SystemConfigurationSettings from '@/pages/admin/platform-settings/SystemConfigurationSettings';
import AuditPage from '@/pages/admin/platform-settings/AuditPage';
import ProfileImageWarningAudit from '@/pages/admin/platform-settings/ProfileImageWarningAudit';
import SecurityPage from '@/pages/security/SecurityPage';
import NotFound from '@/pages/NotFound';
import TrainingCertification from '@/pages/TrainingCertification';
import ResourceCalendarView from '@/pages/resource-calendar/ResourceCalendarView';
import ResourceCalendarStatistics from '@/pages/resource-calendar/ResourceCalendarStatistics';
import ResourceCalendarPlanning from '@/pages/resource-calendar/ResourceCalendarPlanning';
import ProjectsManagement from '@/pages/admin/ProjectsManagement';
import CVTemplatesPage from './pages/admin/cv-templates/CVTemplatesPage';
import CVTemplateEditorPage from './pages/admin/cv-templates/CVTemplateEditorPage';
import CVTemplateViewPage from './pages/admin/cv-templates/CVTemplateViewPage';
import CVTemplateDocumentationPage from './pages/admin/cv-templates/CVTemplateDocumentationPage';
import PIPInitiate from '@/pages/pip/PIPInitiate';
import PIPList from '@/pages/pip/PIPList';
import PIPDashboard from '@/pages/pip/PIPDashboard';
import MySituation from '@/pages/pip/MySituation';
import PIPPMReview from '@/pages/pip/PIPPMReview';
import ManagerPIPList from '@/pages/pip/ManagerPIPList';
import ManagerPMReview from '@/pages/pip/ManagerPMReview';
import AdminPIPView from './pages/pip/AdminPIPView';
import MyTeam from '@/pages/MyTeam';
import NonBilledReportPage from '@/pages/admin/NonBilled/NonBilledReportPage';
import NonBilledSettingsPage from '@/pages/admin/NonBilled/NonBilledSettingsPage';
import NonBilledDashboard from '@/pages/NonBilled/NonBilledDashboard';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import CvDashboard from './pages/employee/CvDashboard';
import './App.css';

// Create QueryClient instance outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Role-aware dashboard component to render the correct dashboard at /dashboard
const RoleDashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
    default:
      return <EmployeeDashboard />;
  }
};

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/auth/logout" element={<FrontChannelLogout />} />
            {/* Protected app with persistent DashboardLayout (flattened URLs) */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Role-aware dashboard */}
              <Route path="/dashboard" element={<RoleDashboard />} />

              {/* Core */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/myteam" element={<ProtectedRoute allowedRoles={['admin','manager','employee']}><MyTeam /></ProtectedRoute>} />
              <Route path="/security" element={<SecurityPage />} />

              {/* Users (admin only) */}
              <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
              <Route path="/users/add" element={<ProtectedRoute allowedRoles={['admin']}><AddUser /></ProtectedRoute>} />
              <Route path="/users/edit/:userId" element={<ProtectedRoute allowedRoles={['admin']}><EditUser /></ProtectedRoute>} />

              {/* Projects (admin only) */}
              <Route path="/projects" element={<ProtectedRoute allowedRoles={['admin']}><ProjectsManagement /></ProtectedRoute>} />

              {/* System Settings (admin only) */}
              <Route path="/system-settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemConfigurationSettings /></ProtectedRoute>} />

              {/* Audit (admin only) */}
              <Route path="/audit/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AuditPage /></ProtectedRoute>} />
              <Route path="/audit/profile-image-warnings" element={<ProtectedRoute allowedRoles={['admin']}><ProfileImageWarningAudit /></ProtectedRoute>} />

              {/* Resource Calendar (admin only) */}
              <Route path="/resource-calendar/planning" element={<ProtectedRoute allowedRoles={['admin']}><ResourceCalendarPlanning /></ProtectedRoute>} />
              <Route path="/resource-calendar/calendar" element={<ProtectedRoute allowedRoles={['admin']}><ResourceCalendarView /></ProtectedRoute>} />
              <Route path="/resource-calendar/resource-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><ResourceCalendarStatistics /></ProtectedRoute>} />
              <Route path="/resource-calendar/resource-settings" element={<ProtectedRoute allowedRoles={['admin']}><ResourcePlanningSettings /></ProtectedRoute>} />

              {/* CV Database (admin/manager subset as needed; using admin here to match prior admin pages) */}
              <Route path="/cv-database/cv-dashboard" element={<ProtectedRoute allowedRoles={['admin','manager']}><CvDashboard /></ProtectedRoute>} />
              <Route path="/cv-database/employee-data" element={<ProtectedRoute allowedRoles={['admin','manager']}><EmployeeData /></ProtectedRoute>} />
              <Route path="/cv-database/training-certification" element={<ProtectedRoute allowedRoles={['admin','manager']}><TrainingCertification /></ProtectedRoute>} />
              <Route path="/cv-database/employee-data-management" element={<ProtectedRoute allowedRoles={['admin']}><EmployeeDataManagement /></ProtectedRoute>} />
              <Route path="/cv-database/cv-templates" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplatesPage /></ProtectedRoute>} />
              <Route path="/cv-database/cv-templates/documentation" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateDocumentationPage /></ProtectedRoute>} />
              <Route path="/cv-database/cv-templates/:id" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateViewPage /></ProtectedRoute>} />
              <Route path="/cv-database/cv-templates/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateEditorPage /></ProtectedRoute>} />
              <Route path="/cv-database/cv-template-settings" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateSettings /></ProtectedRoute>} />

              {/* PIP */}
              <Route path="/pip/initiate" element={<ProtectedRoute allowedRoles={['admin']}><PIPInitiate /></ProtectedRoute>} />
              <Route path="/pip/list" element={<ProtectedRoute allowedRoles={['admin']}><PIPList /></ProtectedRoute>} />
              <Route path="/pip/view/:pipId" element={<ProtectedRoute allowedRoles={['admin']}><AdminPIPView /></ProtectedRoute>} />
              <Route path="/pip/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><PIPDashboard /></ProtectedRoute>} />
              <Route path="/pip/pm-review" element={<ProtectedRoute allowedRoles={['manager']}><ManagerPIPList /></ProtectedRoute>} />
              <Route path="/pip/pm-review/:pipId" element={<ProtectedRoute allowedRoles={['manager']}><ManagerPMReview /></ProtectedRoute>} />
              <Route path="/pip/my-situation" element={<MySituation />} />

              {/* Non-Billed (admin only) */}
              <Route path="/non-billed/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><NonBilledDashboard /></ProtectedRoute>} />
              <Route path="/non-billed/report" element={<ProtectedRoute allowedRoles={['admin']}><NonBilledReportPage /></ProtectedRoute>} />
              <Route path="/non-billed/settings" element={<ProtectedRoute allowedRoles={['admin']}><NonBilledSettingsPage /></ProtectedRoute>} />

              {/* View Profile (admin + manager) */}
              <Route path="/employee/profile/:profileId" element={<ProtectedRoute allowedRoles={['admin','manager']}><ViewProfilePage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
