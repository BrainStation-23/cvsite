
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
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
import PlatformSettings from '@/pages/admin/PlatformSettings';
import EmployeeDataManagement from './pages/admin/EmployeeDataManagement';
import ProfileManagementSettings from '@/pages/admin/platform-settings/ProfileManagementSettings';
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
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/profile"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile/:profileId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ViewProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-data"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <EmployeeData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ViewProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* PIP Routes */}
            {/* Admin-only PIP routes */}
            <Route
              path="/admin/pip/initiate"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PIPInitiate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pip/list"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PIPList />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/pip/view/:pipId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPIPView />
              </ProtectedRoute>
            } />
            <Route
              path="/admin/pip/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PIPDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pip/pm-review/:pipId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PIPPMReview />
                </ProtectedRoute>
              }
            />

            {/* Manager PIP routes */}
            <Route
              path="/manager/pip/pm-review"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerPIPList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/pip/pm-review/:pipId"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerPMReview />
                </ProtectedRoute>
              }
            />
            
            {/* My Situation - available for all roles */}
            <Route
              path="/admin/pip/my-situation"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MySituation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/pip/my-situation"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <MySituation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/pip/my-situation"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <MySituation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/edit/:userId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/user-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
             <Route 
                path="/admin/employee-data-management" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EmployeeDataManagement />
                  </ProtectedRoute>
                } 
              />
            <Route
              path="/admin/employee-data"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <EmployeeData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/employee-data"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <EmployeeData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/training-certification"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TrainingCertification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/training-certification"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <TrainingCertification />
                </ProtectedRoute>
              }
            />
           
             <Route
              path="/admin/resource-calendar/planning"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ResourceCalendarPlanning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resource-calendar/calendar"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ResourceCalendarView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resource-calendar/statistics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ResourceCalendarStatistics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/platform-settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlatformSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProfileManagementSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/resources"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ResourcePlanningSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/cv-templates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CVTemplateSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/system"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemConfigurationSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/audit/profile-image-warnings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProfileImageWarningAudit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CVTemplatesPage/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates/documentation"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CVTemplateDocumentationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CVTemplateViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CVTemplateEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/security"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/security"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/security"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cv-templates/configuration"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  Placeholder
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
