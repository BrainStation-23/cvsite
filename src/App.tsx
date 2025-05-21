
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import SecurityPage from "./pages/security/SecurityPage";
import UserManagement from "./pages/admin/UserManagement";
import EmployeeData from "./pages/employee/EmployeeData";
import PlatformSettings from "./pages/admin/PlatformSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin Routes */}
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
                  <ProfilePage />
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
                <ProtectedRoute allowedRoles={['admin']}>
                  <EmployeeData />
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
            
            {/* Manager Routes */}
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
                  <ProfilePage />
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
              path="/manager/employee-data" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <EmployeeData />
                </ProtectedRoute>
              } 
            />
            
            {/* Employee Routes */}
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
                  <ProfilePage />
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
            
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
