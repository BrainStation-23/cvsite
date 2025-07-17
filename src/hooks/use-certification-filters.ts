
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SbuOption {
  id: string;
  name: string;
}

interface ProviderOption {
  provider: string;
}

export function useCertificationFilters() {
  const { toast } = useToast();
  const [sbuOptions, setSbuOptions] = useState<SbuOption[]>([]);
  const [providerOptions, setProviderOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSbuOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('sbus')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSbuOptions(data || []);
    } catch (error) {
      console.error('Error fetching SBUs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SBU options',
        variant: 'destructive'
      });
    }
  };

  const fetchProviderOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select('provider')
        .not('provider', 'is', null)
        .order('provider');

      if (error) throw error;

      // Get unique providers
      const uniqueProviders = Array.from(
        new Set((data || []).map(item => item.provider).filter(Boolean))
      ).sort();

      setProviderOptions(uniqueProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load provider options',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSbuOptions(),
        fetchProviderOptions()
      ]);
      setIsLoading(false);
    };

    loadFilters();
  }, []);

  return {
    sbuOptions,
    providerOptions,
    isLoading,
    refetchSbuOptions: fetchSbuOptions,
    refetchProviderOptions: fetchProviderOptions
  };
}
