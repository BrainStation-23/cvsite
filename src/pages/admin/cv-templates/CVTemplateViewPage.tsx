
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { EmployeeDataSelector } from '@/components/admin/cv-templates/EmployeeDataSelector';
import { CVTemplatePreview } from '@/components/admin/cv-templates/CVTemplatePreview';

const CVTemplateViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates } = useCVTemplates();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const currentTemplate = templates.find(t => t.id === id);

  const handleBack = () => {
    navigate('/admin/cv-templates');
  };

  const handleEdit = () => {
    navigate(`/admin/cv-templates/${id}/edit`);
  };

  if (!currentTemplate) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Template not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentTemplate.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Template ID: {currentTemplate.id}
              </p>
            </div>
          </div>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Template
          </Button>
        </div>

        {/* Employee Selector */}
        <div className="p-4 border-b bg-muted/30">
          <EmployeeDataSelector
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeSelect={setSelectedEmployeeId}
          />
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          <CVTemplatePreview
            htmlTemplate={currentTemplate.html_template}
            selectedEmployeeId={selectedEmployeeId}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateViewPage;
