
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';

const AzureLoginButton: React.FC = () => {
  const { toast } = useToast();

  const handleAzureLogin = async () => {
    toast({
      title: "Azure Login",
      description: "Azure AD login is not yet configured. Please use email/password login.",
      variant: "default",
    });
  };

  return (
    <Button onClick={handleAzureLogin} variant="outline" className="w-full">
      Sign In with Azure AD
    </Button>
  );
};

export default AzureLoginButton;
