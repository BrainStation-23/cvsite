import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeList from './pages/EmployeeList';
import CreateProfile from './pages/CreateProfile';
import ManagerPIPList from './pages/pip/ManagerPIPList';
import PIPForm from './pages/pip/PIPForm';
import PIPList from './pages/pip/PIPList';
import AdminPIPView from './pages/pip/AdminPIPView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/employees" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <EmployeeList />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/create-profile" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <CreateProfile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pip" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <PIPList />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pip/create" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <PIPForm />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pip/edit/:pipId" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <PIPForm />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pip/view/:pipId" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminPIPView />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={
              <ProtectedRoute requiredRole="manager">
                <DashboardLayout>
                  <ManagerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/manager/pip" element={
              <ProtectedRoute requiredRole="manager">
                <DashboardLayout>
                  <ManagerPIPList />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EmployeeDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/employee/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EmployeeProfile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
