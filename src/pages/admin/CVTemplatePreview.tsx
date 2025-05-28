import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import { EmployeeCombobox } from '@/components/admin/cv-templates/EmployeeCombobox';
import CVPreview from '@/components/admin/cv-templates/CVPreview';

const CVTemplatePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate } = useCVTemplates();
  const { profiles, isLoading: profilesLoading, fetchProfiles } = useEmployeeProfiles();
  const [template, setTemplate] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        const templateData = await getTemplate(id);
        setTemplate(templateData);
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, getTemplate]);

  useEffect(() => {
    // Fetch employee profiles when component mounts - only once
    fetchProfiles();
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (selectedProfileId && profiles) {
      const profile = profiles.find(p => p.id === selectedProfileId);
      setSelectedProfile(profile || null);
    }
  }, [selectedProfileId, profiles]);

  const handleBack = () => {
    navigate('/admin/cv-templates');
  };

  const handleEdit = () => {
    navigate(`/admin/cv-templates/${id}/edit`);
  };

  const handleExport = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting CV...');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading template...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Template not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between py-4 px-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">Template Preview</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{template.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Template
            </Button>
            <Button onClick={handleExport} disabled={!selectedProfile}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="profile">Select Employee Profile</Label>
                    <div className="mt-2">
                      <EmployeeCombobox
                        profiles={profiles || []}
                        value={selectedProfileId}
                        onValueChange={setSelectedProfileId}
                        placeholder="Search and select employee..."
                        isLoading={profilesLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Pages:</span> {template.pages_count}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Orientation:</span> {template.orientation}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {template.is_active ? 'Active' : 'Inactive'}
                  </div>
                  {template.description && (
                    <div className="text-sm">
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-600 mt-1">{template.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-6 h-full">
                  {selectedProfile ? (
                    <CVPreview template={template} profile={selectedProfile} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <p className="text-lg font-medium">No Profile Selected</p>
                        <p className="text-sm mt-2">Choose an employee profile to preview the CV template</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplatePreview;
