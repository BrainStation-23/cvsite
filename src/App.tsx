import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import AdminRoute from './components/AdminRoute';
import UserManagementPage from './pages/admin/UserManagementPage';
import SBUManagementPage from './pages/admin/SBUManagementPage';
import ExpertiseManagementPage from './pages/admin/ExpertiseManagementPage';
import ResourceTypeManagementPage from './pages/admin/ResourceTypeManagementPage';
import CVTemplatesPage from './pages/admin/cv-templates/CVTemplatesPage';
import CVTemplateEditorPage from './pages/admin/cv-templates/CVTemplateEditorPage';
import CVTemplatePreviewPage from './pages/admin/cv-templates/CVTemplatePreviewPage';
import PublicCVPreviewPage from '@/pages/public/PublicCVPreviewPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/public/cv/:token" element={<PublicCVPreviewPage />} />

        {/* Common routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Employee routes */}
        <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />

        {/* Manager routes */}
        <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
        <Route path="/admin/sbus" element={<AdminRoute><SBUManagementPage /></AdminRoute>} />
        <Route path="/admin/expertises" element={<AdminRoute><ExpertiseManagementPage /></AdminRoute>} />
        <Route path="/admin/resource-types" element={<AdminRoute><ResourceTypeManagementPage /></AdminRoute>} />
        <Route path="/admin/cv-templates" element={<AdminRoute><CVTemplatesPage /></AdminRoute>} />
        <Route path="/admin/cv-templates/:id" element={<AdminRoute><CVTemplatePreviewPage /></AdminRoute>} />
        <Route path="/admin/cv-templates/:id/edit" element={<AdminRoute><CVTemplateEditorPage /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
