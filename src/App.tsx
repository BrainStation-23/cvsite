
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';

// Profile pages
import AdminProfile from './pages/profile/AdminProfile';
import ManagerProfile from './pages/profile/ManagerProfile';
import EmployeeProfile from './pages/profile/EmployeeProfile';

// Security pages
import AdminSecurity from './pages/security/AdminSecurity';
import ManagerSecurity from './pages/security/ManagerSecurity';
import EmployeeSecurity from './pages/security/EmployeeSecurity';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import EmployeeDataManagement from './pages/admin/EmployeeDataManagement';
import ProfileManagement from './pages/admin/platform-settings/ProfileManagement';
import ResourcePlanningSettings from './pages/admin/platform-settings/ResourcePlanningSettings';
import CVTemplateSettings from './pages/admin/platform-settings/CVTemplateSettings';
import SystemConfiguration from './pages/admin/platform-settings/SystemConfiguration';
import ProjectManagement from './pages/admin/ProjectManagement';
import CVTemplates from './pages/admin/CVTemplates';

// Manager/Admin Employee pages
import EmployeeData from './pages/employee/EmployeeData';
import TrainingCertification from './pages/employee/TrainingCertification';

// Resource Calendar pages
import AdminResourcePlanning from './pages/resource-calendar/AdminResourcePlanning';
import AdminResourceCalendar from './pages/resource-calendar/AdminResourceCalendar';
import AdminResourceStatistics from './pages/resource-calendar/AdminResourceStatistics';
import ManagerResourcePlanning from './pages/resource-calendar/ManagerResourcePlanning';
import ManagerResourceCalendar from './pages/resource-calendar/ManagerResourceCalendar';
import ManagerResourceStatistics from './pages/resource-calendar/ManagerResourceStatistics';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/security" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSecurity />
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
                path="/admin/platform-settings/profile" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProfileManagement />
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
                    <SystemConfiguration />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/projects" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProjectManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/cv-templates" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CVTemplates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/employee-data" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EmployeeData />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/training-certification" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TrainingCertification />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/resource-calendar/planning" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminResourcePlanning />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/resource-calendar/calendar" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminResourceCalendar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/resource-calendar/statistics" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminResourceStatistics />
                  </ProtectedRoute>
                } 
              />

              {/* Manager routes */}
              <Route 
                path="/manager/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/profile" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/security" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerSecurity />
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
                path="/manager/training-certification" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <TrainingCertification />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/resource-calendar/planning" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerResourcePlanning />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/resource-calendar/calendar" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerResourceCalendar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/resource-calendar/statistics" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerResourceStatistics />
                  </ProtectedRoute>
                } 
              />

              {/* Employee routes */}
              <Route 
                path="/employee/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/profile" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/security" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeSecurity />
                  </ProtectedRoute>
                } 
              />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
