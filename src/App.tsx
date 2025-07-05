import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import UserManagement from './pages/admin/UserManagement';
import AddUser from './pages/admin/AddUser';
import EditUser from './pages/admin/EditUser';
import ResourcePlanning from './pages/admin/ResourcePlanning';
import PlatformSettings from './pages/admin/PlatformSettings';
import NoteCategories from './pages/admin/NoteCategories';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/user-management" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/add" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AddUser />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/edit/:userId" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EditUser />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/admin/resource-planning"
            element={
              <ProtectedRoute requiredRole="admin">
                <ResourcePlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/platform-settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <PlatformSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/note-categories"
            element={
              <ProtectedRoute requiredRole="admin">
                <NoteCategories />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
