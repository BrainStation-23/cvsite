
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Callback from './pages/auth/Callback';
import FrontChannelLogout from './pages/auth/FrontChannelLogout';
import NotFound from './pages/NotFound';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';

// Profile pages
import ProfilePage from './pages/profile/ProfilePage';
import ViewProfilePage from './pages/employee/ViewProfilePage';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import PlatformSettings from './pages/admin/PlatformSettings';
import CVTemplates from './pages/admin/CVTemplates';
import CVTemplateCreate from './pages/admin/CVTemplateCreate';
import CVTemplateEdit from './pages/admin/CVTemplateEdit';

// Employee pages
import EmployeeData from './pages/employee/EmployeeData';

// Security pages
import SecurityPage from './pages/security/SecurityPage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<Callback />} />
                <Route path="/auth/logout" element={<FrontChannelLogout />} />

                {/* Protected dashboard routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manager/dashboard" 
                  element={
                    <ProtectedRoute requiredRole={["admin", "manager"]}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee/dashboard" 
                  element={
                    <ProtectedRoute requiredRole={["admin", "manager", "employee"]}>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Profile routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute requiredRole={["admin", "manager", "employee"]}>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee/profile/:employeeId" 
                  element={
                    <ProtectedRoute requiredRole={["admin", "manager"]}>
                      <ViewProfilePage />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin routes */}
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <PlatformSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/cv-templates" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CVTemplates />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/cv-templates/create" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CVTemplateCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/cv-templates/:templateId/edit" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CVTemplateEdit />
                    </ProtectedRoute>
                  } 
                />

                {/* Employee routes */}
                <Route 
                  path="/employee/data" 
                  element={
                    <ProtectedRoute requiredRole={["admin", "manager"]}>
                      <EmployeeData />
                    </ProtectedRoute>
                  } 
                />

                {/* Security routes */}
                <Route 
                  path="/security" 
                  element={
                    <ProtectedRoute requiredRole={["admin", "manager", "employee"]}>
                      <SecurityPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
