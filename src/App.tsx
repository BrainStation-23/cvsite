
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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
import UnifiedDashboard from '@/pages/dashboard/UnifiedDashboard';
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
import ManagerPIPList from '@/pages/pip/ManagerPIPList';
import ManagerPMReview from '@/pages/pip/ManagerPMReview';
import AdminPIPView from './pages/pip/AdminPIPView';
import MyTeam from '@/pages/MyTeam';
import NonBilledReportPage from '@/pages/admin/NonBilled/NonBilledReportPage';
import NonBilledSettingsPage from '@/pages/admin/NonBilled/NonBilledSettingsPage';
import NonBilledDashboard from '@/pages/NonBilled/NonBilledDashboard';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import CvDashboard from './pages/employee/CvDashboard';
import PlatformFeedback from './pages/platform-feedback';
import RoleManagement from '@/pages/admin/roles/RoleManagement';
import CreateRole from '@/pages/admin/roles/CreateRole';
import EditRole from '@/pages/admin/roles/EditRole';
import RolePermissions from '@/pages/admin/roles/RolePermissions';
import ModuleManagement from '@/pages/admin/modules/ModuleManagement';
import CreateModule from '@/pages/admin/modules/CreateModule';
import EditModule from '@/pages/admin/modules/EditModule';
import CreateSubModule from '@/pages/admin/modules/CreateSubModule';
import EditSubModule from '@/pages/admin/modules/EditSubModule';
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

// Permission-based unified dashboard component
const PermissionBasedDashboard: React.FC = () => {
  return <UnifiedDashboard />;
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
              {/* Core */}
              <Route path="dashboard" element={
                <ProtectedRoute requiredModuleAccess="General" requiredSubModuleAccess="Dashboard" requiredPermissionType="read">
                  <PermissionBasedDashboard />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute requiredModuleAccess="General" requiredSubModuleAccess="My Profile" requiredPermissionType="read">
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="myteam" element={
                <ProtectedRoute requiredModuleAccess="General" requiredSubModuleAccess="My Team" requiredPermissionType="read">
                  <MyTeam />
                </ProtectedRoute>
              } />
              <Route path="security" element={
                <ProtectedRoute requiredModuleAccess="General" requiredSubModuleAccess="Security" requiredPermissionType="read">
                  <SecurityPage />
                </ProtectedRoute>
              } />
              <Route path="platform-feedback" element={
                <ProtectedRoute requiredModuleAccess="General" requiredSubModuleAccess="Platform Feedback" requiredPermissionType="read">
                  <PlatformFeedback />
                </ProtectedRoute>
              } />

              {/* CV Database */}
              <Route path="cv-database" element={<ProtectedRoute requiredModuleAccess="CV Database"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Dashboard" requiredPermissionType="read"><CvDashboard /></ProtectedRoute>} />
                <Route path="employee-data" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Search" requiredPermissionType="read"><EmployeeData /></ProtectedRoute>} />
                <Route path="training-certification" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Search" requiredPermissionType="read"><TrainingCertification /></ProtectedRoute>} />
                <Route path="employee-data-management" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Completion" requiredPermissionType="read"><EmployeeDataManagement /></ProtectedRoute>} />
                <Route path="cv-templates">
                  <Route index element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Templates" requiredPermissionType="read"><CVTemplatesPage /></ProtectedRoute>} />
                  <Route path="documentation" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Templates" requiredPermissionType="read"><CVTemplateDocumentationPage /></ProtectedRoute>} />
                  <Route path=":id" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Templates" requiredPermissionType="read"><CVTemplateViewPage /></ProtectedRoute>} />
                  <Route path=":id/edit" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Templates" requiredPermissionType="update"><CVTemplateEditorPage /></ProtectedRoute>} />
                </Route>
                <Route path="cv-template-settings" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Settings" requiredPermissionType="write"><CVTemplateSettings /></ProtectedRoute>} />
              </Route>

              {/* Resource Calendar */}
              <Route path="resource-calendar" element={<ProtectedRoute requiredModuleAccess="Resource Calendar"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<ProtectedRoute requiredModuleAccess="Resource Calendar" requiredSubModuleAccess="Resource Dashboard" requiredPermissionType="read"><ResourceCalendarStatistics /></ProtectedRoute>} />
                <Route path="planning" element={<ProtectedRoute requiredModuleAccess="Resource Calendar" requiredSubModuleAccess="Planning" requiredPermissionType="read"><ResourceCalendarPlanning /></ProtectedRoute>} />
                <Route path="calendar" element={<ProtectedRoute requiredModuleAccess="Resource Calendar" requiredSubModuleAccess="Calendar View" requiredPermissionType="read"><ResourceCalendarView /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute requiredModuleAccess="Resource Calendar" requiredSubModuleAccess="Resource Settings" requiredPermissionType="read"><ResourcePlanningSettings /></ProtectedRoute>} />
              </Route>

              {/* Non-Billed */}
              <Route path="non-billed" element={<ProtectedRoute requiredModuleAccess="Non-Billed Management"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<ProtectedRoute requiredModuleAccess="Non-Billed Management" requiredSubModuleAccess="Non-Billed Dashboard" requiredPermissionType="read"><NonBilledDashboard /></ProtectedRoute>} />
                <Route path="report" element={<ProtectedRoute requiredModuleAccess="Non-Billed Management" requiredSubModuleAccess="Non-Billed Report" requiredPermissionType="read"><NonBilledReportPage /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute requiredModuleAccess="Non-Billed Management" requiredSubModuleAccess="Non-Billed Settings" requiredPermissionType="read"><NonBilledSettingsPage /></ProtectedRoute>} />
              </Route>

              {/* PIP */}
              <Route path="pip">
              <Route path="dashboard" element={<ProtectedRoute requiredModuleAccess="PIP" requiredSubModuleAccess="PIP Dashboard" requiredPermissionType="read"><PIPDashboard /></ProtectedRoute>} />
                <Route path="initiate" element={<ProtectedRoute requiredModuleAccess="PIP" requiredSubModuleAccess="Initiate" requiredPermissionType="write"><PIPInitiate /></ProtectedRoute>} />
                <Route path="list" element={<ProtectedRoute requiredModuleAccess="PIP" requiredSubModuleAccess="PIP List" requiredPermissionType="read"><PIPList /></ProtectedRoute>} />
                <Route path="view/:pipId" element={<ProtectedRoute requiredModuleAccess="PIP" requiredSubModuleAccess="PIP List" requiredPermissionType="read"><AdminPIPView /></ProtectedRoute>} />
                <Route path="pm-review" element={<ProtectedRoute requiredModuleAccess="PIP" requiredSubModuleAccess="PM Review" requiredPermissionType="read"><ManagerPIPList /></ProtectedRoute>} />
                <Route path="pm-review/:pipId" element={<ProtectedRoute requiredModuleAccess="PIP" requiredSubModuleAccess="PM Review" requiredPermissionType="update"><ManagerPMReview /></ProtectedRoute>} />
                <Route path="my-situation" element={<MySituation />} />
              </Route>

              {/* View Profile */}
              <Route path="employee/profile/:profileId" element={<ProtectedRoute requiredModuleAccess="CV Database" requiredSubModuleAccess="CV Search" requiredPermissionType="update"><ViewProfilePage /></ProtectedRoute>} />

              {/* Users */}
              <Route path="users" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="User Management" requiredPermissionType="read"><Outlet /></ProtectedRoute>}>
                <Route index element={<UserManagement />} />
                <Route path="add" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="User Management" requiredPermissionType="write"><AddUser /></ProtectedRoute>} />
                <Route path="edit/:userId" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="User Management" requiredPermissionType="update"><EditUser /></ProtectedRoute>} />
              </Route>

              {/* Projects */}
              <Route path="projects" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Projects" requiredPermissionType="read"><ProjectsManagement /></ProtectedRoute>} />

              {/* System Settings */}
              <Route path="system-settings" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="System Settings" requiredPermissionType="read"><SystemConfigurationSettings /></ProtectedRoute>} />

              {/* Audit */}
              <Route path="audit" element={<ProtectedRoute requiredModuleAccess="Audit" requiredSubModuleAccess="Audit Dashboard" requiredPermissionType="read"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<AuditPage />} />
                <Route path="profile-image-warnings" element={<ProtectedRoute requiredModuleAccess="Audit" requiredSubModuleAccess="Audit Dashboard" requiredPermissionType="read"><ProfileImageWarningAudit /></ProtectedRoute>} />
              </Route>

              {/* Role Management */}
              <Route path="admin/roles" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Role Management" requiredPermissionType="read"><Outlet /></ProtectedRoute>}>
                <Route index element={<RoleManagement />} />
                <Route path="create" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Role Management" requiredPermissionType="write"><CreateRole /></ProtectedRoute>} />
                <Route path="edit/:roleId" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Role Management" requiredPermissionType="update"><EditRole /></ProtectedRoute>} />
                <Route path="permissions/:roleId" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Role Management" requiredPermissionType="update"><RolePermissions /></ProtectedRoute>} />
              </Route>

              {/* Module Management */}
              <Route path="admin/modules" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Module Management" requiredPermissionType="read"><Outlet /></ProtectedRoute>}>
                <Route index element={<ModuleManagement />} />
                <Route path="create" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Module Management" requiredPermissionType="write"><CreateModule /></ProtectedRoute>} />
                <Route path=":id/edit" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Module Management" requiredPermissionType="update"><EditModule /></ProtectedRoute>} />
                <Route path=":moduleId/submodules/create" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Module Management" requiredPermissionType="write"><CreateSubModule /></ProtectedRoute>} />
                <Route path=":moduleId/submodules/:id/edit" element={<ProtectedRoute requiredModuleAccess="Admin Configuration" requiredSubModuleAccess="Module Management" requiredPermissionType="update"><EditSubModule /></ProtectedRoute>} />
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
