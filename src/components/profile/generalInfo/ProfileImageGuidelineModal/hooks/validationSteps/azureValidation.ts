
import { ValidationResult } from '../../types';
import { supabase } from '@/integrations/supabase/client';

export const runAzureValidation = async (file: File): Promise<any> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const { data, error } = await supabase.functions.invoke('analyze-profile-image', {
    body: { imageBase64: base64 }
  });
  
  if (error) throw new Error(error.message);
  
  return data;
};
