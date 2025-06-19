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
import PlatformSettings from '@/pages/admin/PlatformSettings';
import CVTemplates from '@/pages/admin/CVTemplates';
import CVTemplateEdit from '@/pages/admin/CVTemplateEdit';
import CVTemplatesConfigurationPage from '@/pages/cv-templates/configuration';
import SecurityPage from '@/pages/security/SecurityPage';
import NotFound from '@/pages/NotFound';
import TrainingCertification from '@/pages/TrainingCertification';
import './App.css';


const queryClient = new QueryClient();

function App() {
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
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
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
            {/* Training and Certification Route (admin/manager) */}
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
              path="/admin/platform-settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlatformSettings />
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
              path="/admin/cv-templates/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CVTemplateEdit />
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
                  <CVTemplatesConfigurationPage />
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
