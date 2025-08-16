import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import ResourcePlanningPage from '@/pages/ResourcePlanningPage';
import WeeklyValidationPage from '@/pages/WeeklyValidationPage';
import ResourceCalendarPage from '@/pages/ResourceCalendarPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfileCompletionPage from '@/pages/ProfileCompletionPage';
import ProfileTemplatePage from '@/pages/ProfileTemplatePage';
import ProfileTemplateEditorPage from '@/pages/ProfileTemplateEditorPage';
import SbuSettingsPage from '@/pages/admin/sbu/SbuSettingsPage';
import UniversitySettingsPage from '@/pages/admin/university/UniversitySettingsPage';
import DesignationSettingsPage from '@/pages/admin/designation/DesignationSettingsPage';
import HrContactSettingsPage from '@/pages/admin/hr-contact/HrContactSettingsPage';
import ReferenceSettingsPage from '@/pages/admin/reference/ReferenceSettingsPage';
import UserManagementPage from '@/pages/admin/user-management/UserManagementPage';
import ResourceTypeSettingsPage from '@/pages/admin/resource-type/ResourceTypeSettingsPage';
import BillTypeSettingsPage from '@/pages/admin/bill-type/BillTypeSettingsPage';
import ExpertiseTypeSettingsPage from '@/pages/admin/expertise-type/ExpertiseTypeSettingsPage';
import ProjectSettingsPage from '@/pages/admin/project/ProjectSettingsPage';
import CVTemplatesPage from '@/pages/admin/cv-templates/CVTemplatesPage';
import CVTemplateEditorPage from '@/pages/admin/cv-templates/CVTemplateEditorPage';

import CVTemplateDocumentationPage from '@/pages/admin/cv-templates/CVTemplateDocumentationPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<ResourcePlanningPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile-completion/:id" element={<ProfileCompletionPage />} />
          <Route path="/weekly-validation" element={<WeeklyValidationPage />} />
          <Route path="/resource-calendar" element={<ResourceCalendarPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Settings routes */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Profile Template routes */}
          <Route path="/admin/profile-templates" element={<ProfileTemplatePage />} />
          <Route path="/admin/profile-templates/new" element={<ProfileTemplateEditorPage />} />
          <Route path="/admin/profile-templates/:id/edit" element={<ProfileTemplateEditorPage />} />
          
          {/* SBU Settings routes */}
          <Route path="/admin/sbu-settings" element={<SbuSettingsPage />} />
          
          {/* University Settings routes */}
          <Route path="/admin/university-settings" element={<UniversitySettingsPage />} />
          
          {/* Designation Settings routes */}
          <Route path="/admin/designation-settings" element={<DesignationSettingsPage />} />
          
          {/* HR Contact Settings routes */}
          <Route path="/admin/hr-contact-settings" element={<HrContactSettingsPage />} />

          {/* Reference Settings routes */}
          <Route path="/admin/reference-settings" element={<ReferenceSettingsPage />} />
          
          {/* User Management routes */}
          <Route path="/admin/user-management" element={<UserManagementPage />} />

          {/* Resource Type Settings routes */}
          <Route path="/admin/resource-type-settings" element={<ResourceTypeSettingsPage />} />

          {/* Bill Type Settings routes */}
          <Route path="/admin/bill-type-settings" element={<BillTypeSettingsPage />} />

          {/* Expertise Type Settings routes */}
          <Route path="/admin/expertise-type-settings" element={<ExpertiseTypeSettingsPage />} />

          {/* Project Settings routes */}
          <Route path="/admin/project-settings" element={<ProjectSettingsPage />} />
          
          {/* CV Template routes */}
          <Route path="/admin/cv-templates" element={<CVTemplatesPage />} />
          <Route path="/admin/cv-templates/new" element={<CVTemplateEditorPage />} />
          <Route path="/admin/cv-templates/:id/edit" element={<CVTemplateEditorPage />} />
          <Route path="/admin/cv-templates/documentation" element={<CVTemplateDocumentationPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
