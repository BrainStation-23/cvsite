
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
}

interface ProfileSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProfileSelect: React.FC<ProfileSelectProps> = ({
  value,
  onChange,
  placeholder = "Select profile...",
  disabled = false,
}) => {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, employee_id, first_name, last_name')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.first_name} {profile.last_name} ({profile.employee_id})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
