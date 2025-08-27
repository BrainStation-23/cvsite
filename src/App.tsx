import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Security from './pages/Security';
import UserManagement from './pages/UserManagement';
import EmployeeDataManagement from './pages/EmployeeDataManagement';
import PlatformSettings from './pages/PlatformSettings';
import Projects from './pages/Projects';
import EmployeeData from './pages/EmployeeData';
import TrainingCertification from './pages/TrainingCertification';
import ResourceCalendar from './pages/ResourceCalendar';
import CVTemplates from './pages/CVTemplates';
import ProtectedRoute from './components/ProtectedRoute';
import ResourcePlanning from './pages/ResourcePlanning';
import PIPInitiate from './pages/pip/PIPInitiate';
import PIPList from './pages/pip/PIPList';
import PIPDashboard from './pages/pip/PIPDashboard';
import PIPMySituation from './pages/pip/PIPMySituation';
import PIPEdit from './pages/pip/PIPEdit';
import PIPView from './pages/pip/PIPView';
import PIPPMReview from './pages/pip/PIPPMReview';
import ManagerPIPList from './pages/pip/ManagerPIPList';
import ManagerPMReview from './pages/pip/ManagerPMReview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Security />
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
          path="/admin/platform-settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlatformSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Projects />
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
          path="/admin/resource-calendar/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ResourceCalendar />
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
        {/* PIP Routes - Admin */}
        <Route
          path="/admin/pip/initiate"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PIPInitiate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pip/list"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PIPList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pip/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PIPDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pip/edit/:pipId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PIPEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pip/view/:pipId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PIPView />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/profile"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/security"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Security />
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
          path="/manager/resource-calendar/*"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ResourceCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/resource-planning"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ResourcePlanning />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/security"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Security />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/resource-calendar/*"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <ResourceCalendar />
            </ProtectedRoute>
          }
        />

        {/* PIP Routes - All Roles */}
        <Route
          path="/admin/pip/my-situation"
          element={
            <ProtectedRoute>
              <PIPMySituation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/pip/my-situation"
          element={
            <ProtectedRoute>
              <PIPMySituation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/pip/my-situation"
          element={
            <ProtectedRoute>
              <PIPMySituation />
            </ProtectedRoute>
          }
        />
        
        {/* Admin PIP Routes */}
        <Route 
          path="/admin/pip/pm-review/:pipId" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PIPPMReview />
            </ProtectedRoute>
          } 
        />
        
        {/* Manager PIP Routes */}
        <Route 
          path="/manager/pip/pm-review" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerPIPList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/pip/pm-review/:pipId" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerPMReview />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
