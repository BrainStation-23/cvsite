
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
            
            {/* Nested Admin Routes with persistent DashboardLayout */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="myteam" element={<MyTeam />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="system-settings" element={<SystemConfigurationSettings />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="audit/profile-image-warnings" element={<ProfileImageWarningAudit />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/edit/:userId" element={<EditUser />} />
              <Route path="employee-data-management" element={<EmployeeDataManagement />} />
              <Route path="employee-data" element={<EmployeeData />} />
              <Route path="training-certification" element={<TrainingCertification />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="security" element={<SecurityPage />} />
              
              {/* Resource Calendar */}
              <Route path="resource-calendar/planning" element={<ResourceCalendarPlanning />} />
              <Route path="resource-calendar/calendar" element={<ResourceCalendarView />} />
              <Route path="resource-calendar/resource-dashboard" element={<ResourceCalendarStatistics />} />
              <Route path="resource-calendar/resource-settings" element={<ResourcePlanningSettings />} />
              
              {/* CV Templates */}
              <Route path="cv-database/cv-dashboard" element={<CvDashboard />} />
              <Route path="cv-database/employee-data" element={<EmployeeData />} />
              <Route path="cv-database/training-certification" element={<TrainingCertification />} />
              <Route path="cv-database/employee-data-management" element={<EmployeeDataManagement />} />
              <Route path="cv-database/cv-templates" element={<CVTemplatesPage />} />
              <Route path="cv-database/cv-templates/documentation" element={<CVTemplateDocumentationPage />} />
              <Route path="cv-database/cv-templates/:id" element={<CVTemplateViewPage />} />
              <Route path="cv-database/cv-templates/:id/edit" element={<CVTemplateEditorPage />} />
              <Route path="cv-database/cv-template-settings" element={<CVTemplateSettings />} />
              
              {/* PIP Management */}
              <Route path="pip/initiate" element={<PIPInitiate />} />
              <Route path="pip/list" element={<PIPList />} />
              <Route path="pip/view/:pipId" element={<AdminPIPView />} />
              <Route path="pip/dashboard" element={<PIPDashboard />} />
              <Route path="pip/pm-review/:pipId" element={<PIPPMReview />} />
              <Route path="pip/my-situation" element={<MySituation />} />
              
              {/* Bench Management */}
              <Route path="non-billed-management/dashboard" element={<NonBilledDashboard />} />
              <Route path="non-billed-management/report" element={<NonBilledReportPage />} />
              <Route path="non-billed-management/settings" element={<NonBilledSettingsPage />} />
            </Route>

            {/* Nested Manager Routes with persistent DashboardLayout */}
            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="myteam" element={<MyTeam />} />
              <Route path="employee-data" element={<EmployeeData />} />
              <Route path="training-certification" element={<TrainingCertification />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="pip/pm-review" element={<ManagerPIPList />} />
              <Route path="pip/pm-review/:pipId" element={<ManagerPMReview />} />
              <Route path="pip/my-situation" element={<MySituation />} />
            </Route>

            {/* Nested Employee Routes with persistent DashboardLayout */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="myteam" element={<MyTeam />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="pip/my-situation" element={<MySituation />} />
            </Route>

            <Route
              path="/employee/profile/:profileId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <ViewProfilePage />
                  </DashboardLayout>
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
