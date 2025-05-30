import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import SectionForm from './SectionForm';
import SectionList from './SectionList';
import { useTemplateConfiguration } from '@/hooks/templates/use-template-configuration';
import { supabase } from '@/integrations/supabase/client';

interface SectionManagerProps {
  templateId: string;
  refetch: () => void;
}

const SectionManager: React.FC<SectionManagerProps> = ({ templateId, refetch }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { sections, isLoading } = useTemplateConfiguration(templateId);

  const handleCreateSection = () => {
    setIsCreating(true);
  };

  const handleSectionCreated = () => {
    setIsCreating(false);
    refetch();
  };

  const handleSectionDeleted = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sections</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : (
          <>
            <SectionList
              templateId={templateId}
              sections={sections || []}
              onSectionDeleted={handleSectionDeleted}
              refetch={refetch}
            />
            {!isCreating && (
              <Button onClick={handleCreateSection}>
                Add Section
              </Button>
            )}
            {isCreating && (
              <SectionForm
                templateId={templateId}
                onSectionCreated={handleSectionCreated}
                onCancel={() => setIsCreating(false)}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionManager;

