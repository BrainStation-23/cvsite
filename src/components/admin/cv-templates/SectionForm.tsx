
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SectionFormProps {
  templateId: string;
  onSectionCreated: () => void;
  onCancel: () => void;
}

const SectionForm: React.FC<SectionFormProps> = ({
  templateId,
  onSectionCreated,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Section name is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const { error } = await supabase
        .from('cv_template_sections')
        .insert({
          template_id: templateId,
          name: name.trim(),
          type: 'custom',
          order_index: 999
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section created successfully",
      });

      onSectionCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Section</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Section name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Section'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionForm;
