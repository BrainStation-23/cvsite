
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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
              <Route path="dashboard" element={<RoleDashboard />} />

              {/* Core */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="myteam" element={<MyTeam />} />
              <Route path="security" element={<SecurityPage />} />

              {/* CV Database (admin/manager) */}
              <Route path="cv-database" element={<ProtectedRoute allowedRoles={['admin','manager']}><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<CvDashboard />} />
                <Route path="employee-data" element={<EmployeeData />} />
                <Route path="training-certification" element={<TrainingCertification />} />
                <Route path="employee-data-management" element={<ProtectedRoute allowedRoles={['admin']}><EmployeeDataManagement /></ProtectedRoute>} />
                <Route path="cv-templates">
                  <Route index element={<ProtectedRoute allowedRoles={['admin']}><CVTemplatesPage /></ProtectedRoute>} />
                  <Route path="documentation" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateDocumentationPage /></ProtectedRoute>} />
                  <Route path=":id" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateViewPage /></ProtectedRoute>} />
                  <Route path=":id/edit" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateEditorPage /></ProtectedRoute>} />
                </Route>
                <Route path="cv-template-settings" element={<ProtectedRoute allowedRoles={['admin']}><CVTemplateSettings /></ProtectedRoute>} />
              </Route>

              {/* Resource Calendar (admin only) */}
              <Route path="resource-calendar" element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<ResourceCalendarStatistics />} />
                <Route path="planning" element={<ResourceCalendarPlanning />} />
                <Route path="calendar" element={<ResourceCalendarView />} />
                <Route path="settings" element={<ResourcePlanningSettings />} />
              </Route>

              {/* Non-Billed (admin only) */}
              <Route path="non-billed" element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<NonBilledDashboard />} />
                <Route path="report" element={<NonBilledReportPage />} />
                <Route path="settings" element={<NonBilledSettingsPage />} />
              </Route>

              {/* PIP */}
              <Route path="pip">
                <Route path="initiate" element={<ProtectedRoute allowedRoles={['admin']}><PIPInitiate /></ProtectedRoute>} />
                <Route path="list" element={<ProtectedRoute allowedRoles={['admin']}><PIPList /></ProtectedRoute>} />
                <Route path="view/:pipId" element={<ProtectedRoute allowedRoles={['admin']}><AdminPIPView /></ProtectedRoute>} />
                <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin']}><PIPDashboard /></ProtectedRoute>} />
                <Route path="pm-review" element={<ProtectedRoute allowedRoles={['manager']}><ManagerPIPList /></ProtectedRoute>} />
                <Route path="pm-review/:pipId" element={<ProtectedRoute allowedRoles={['manager']}><ManagerPMReview /></ProtectedRoute>} />
                <Route path="my-situation" element={<MySituation />} />
              </Route>

              {/* View Profile (admin + manager) */}
              <Route path="employee/profile/:profileId" element={<ProtectedRoute allowedRoles={['admin','manager']}><ViewProfilePage /></ProtectedRoute>} />

              {/* Users (admin only) */}
              <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
                <Route index element={<UserManagement />} />
                <Route path="add" element={<AddUser />} />
                <Route path="edit/:userId" element={<EditUser />} />
              </Route>

              {/* Projects (admin only) */}
              <Route path="projects" element={<ProtectedRoute allowedRoles={['admin']}><ProjectsManagement /></ProtectedRoute>} />

              {/* System Settings (admin only) */}
              <Route path="system-settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemConfigurationSettings /></ProtectedRoute>} />

              {/* Audit (admin only) */}
              <Route path="audit" element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<AuditPage />} />
                <Route path="profile-image-warnings" element={<ProfileImageWarningAudit />} />
              </Route>
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
