
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AzureLoginButtonProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const AzureLoginButton: React.FC<AzureLoginButtonProps> = ({ loading, setLoading }) => {
  const handleAzureLogin = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email',
          redirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        throw error;
      }

      // The redirect will happen automatically if successful
      console.log('Azure AD login initiated');
      
    } catch (error: any) {
      console.error('Azure login error:', error);
      toast({
        title: "Azure Login Failed",
        description: error.message || "Unable to authenticate with Microsoft Azure AD",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
      onClick={handleAzureLogin}
      disabled={loading}
    >
      <div className="flex items-center justify-center space-x-3">
        <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0H10V10H0V0Z" fill="#F25022"/>
          <path d="M11 0H21V10H11V0Z" fill="#7FBA00"/>
          <path d="M0 11H10V21H0V11Z" fill="#00A4EF"/>
          <path d="M11 11H21V21H11V11Z" fill="#FFB900"/>
        </svg>
        <span className="font-medium">
          {loading ? "Connecting..." : "Continue with Microsoft"}
        </span>
      </div>
    </Button>
  );
};
