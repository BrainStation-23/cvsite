
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
import MyTeam from '@/pages/MyTeam';
import BenchReportPage from '@/pages/admin/bench/BenchReportPage';
import BenchSettingsPage from '@/pages/admin/bench/BenchSettingsPage';
import BenchDashboard from '@/pages/bench/BenchDashboard';
import DashboardLayout from '@/components/Layout/DashboardLayout';
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
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/edit/:userId" element={<EditUser />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="employee-data-management" element={<EmployeeDataManagement />} />
              <Route path="employee-data" element={<EmployeeData />} />
              <Route path="training-certification" element={<TrainingCertification />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="security" element={<SecurityPage />} />
              
              {/* Resource Calendar */}
              <Route path="resource-calendar/planning" element={<ResourceCalendarPlanning />} />
              <Route path="resource-calendar/calendar" element={<ResourceCalendarView />} />
              <Route path="resource-calendar/statistics" element={<ResourceCalendarStatistics />} />
              
              {/* Platform Settings */}
              <Route path="platform-settings" element={<PlatformSettings />} />
              <Route path="platform-settings/profile" element={<ProfileManagementSettings />} />
              <Route path="platform-settings/resources" element={<ResourcePlanningSettings />} />
              <Route path="platform-settings/cv-templates" element={<CVTemplateSettings />} />
              <Route path="platform-settings/system" element={<SystemConfigurationSettings />} />
              <Route path="platform-settings/audit" element={<AuditPage />} />
              <Route path="platform-settings/audit/profile-image-warnings" element={<ProfileImageWarningAudit />} />
              
              {/* CV Templates */}
              <Route path="cv-templates" element={<CVTemplatesPage />} />
              <Route path="cv-templates/documentation" element={<CVTemplateDocumentationPage />} />
              <Route path="cv-templates/:id" element={<CVTemplateViewPage />} />
              <Route path="cv-templates/:id/edit" element={<CVTemplateEditorPage />} />
              
              {/* PIP Management */}
              <Route path="pip/initiate" element={<PIPInitiate />} />
              <Route path="pip/list" element={<PIPList />} />
              <Route path="pip/view/:pipId" element={<AdminPIPView />} />
              <Route path="pip/dashboard" element={<PIPDashboard />} />
              <Route path="pip/pm-review/:pipId" element={<PIPPMReview />} />
              <Route path="pip/my-situation" element={<MySituation />} />
              
              {/* Bench Management */}
              <Route path="bench/dashboard" element={<BenchDashboard />} />
              <Route path="bench/report" element={<BenchReportPage />} />
              <Route path="bench/settings" element={<BenchSettingsPage />} />
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

            {/* Legacy routes for backward compatibility */}
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/myteam"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <MyTeam />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/myteam"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <MyTeam />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/myteam"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout>
                    <MyTeam />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/profile"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/employee-data"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <EmployeeData />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <ViewProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout>
                    <EmployeeDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <ManagerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout>
                    <EmployeeDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <ManagerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* PIP Routes */}
            {/* Admin-only PIP routes */}
            <Route
              path="/admin/pip/initiate"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <PIPInitiate />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pip/list"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <PIPList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/admin/pip/view/:pipId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminPIPView />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route
              path="/admin/pip/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <PIPDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pip/pm-review/:pipId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <PIPPMReview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Manager PIP routes */}
            <Route
              path="/manager/pip/pm-review"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <ManagerPIPList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/pip/pm-review/:pipId"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <ManagerPMReview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* My Situation - available for all roles */}
            <Route
              path="/admin/pip/my-situation"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <MySituation />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/pip/my-situation"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <MySituation />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/pip/my-situation"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout>
                    <MySituation />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <UserManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AddUser />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/edit/:userId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <EditUser />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/user-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <UserManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route 
                path="/admin/employee-data-management" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <EmployeeDataManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
            <Route
              path="/admin/employee-data"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <EmployeeData />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/employee-data"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <EmployeeData />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/training-certification"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <TrainingCertification />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/training-certification"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <DashboardLayout>
                    <TrainingCertification />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
           
             <Route
              path="/admin/resource-calendar/planning"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <ResourceCalendarPlanning />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resource-calendar/calendar"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <ResourceCalendarView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resource-calendar/statistics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <DashboardLayout>
                    <ResourceCalendarStatistics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/platform-settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <PlatformSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ProfileManagementSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/resources"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ResourcePlanningSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/cv-templates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <CVTemplateSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/system"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <SystemConfigurationSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AuditPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platform-settings/audit/profile-image-warnings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ProfileImageWarningAudit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ProjectsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Bench Management Routes */}
            <Route
              path="/admin/bench/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <BenchDashboard />
                    </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bench/report"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <BenchReportPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bench/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <BenchSettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <CVTemplatesPage/>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates/documentation"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <CVTemplateDocumentationPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <CVTemplateViewPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cv-templates/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <CVTemplateEditorPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/security"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <SecurityPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/security"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout>
                    <SecurityPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/security"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout>
                    <SecurityPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SecurityPage />
                  </DashboardLayout>
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
