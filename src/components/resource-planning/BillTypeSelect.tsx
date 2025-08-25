
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

interface BillType {
  id: string;
  name: string;
}

interface BillTypeSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const BillTypeSelect: React.FC<BillTypeSelectProps> = ({
  value,
  onChange,
  placeholder = "Select bill type...",
  disabled = false,
}) => {
  const { data: billTypes = [], isLoading } = useQuery({
    queryKey: ['bill-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bill_types')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as BillType[];
    },
  });

  return (
    <Select value={value || ''} onValueChange={(val) => onChange(val || null)} disabled={disabled || isLoading}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">None</SelectItem>
        {billTypes.map((billType) => (
          <SelectItem key={billType.id} value={billType.id}>
            {billType.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
