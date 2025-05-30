import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

const AzureLoginButton: React.FC = () => {
  const { signInWithAzure } = useAuth();
  const { toast } = useToast();

  const handleAzureLogin = async () => {
    try {
      await signInWithAzure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to sign in with Azure.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleAzureLogin}>
      Sign In with Azure
    </Button>
  );
};

export default AzureLoginButton;
