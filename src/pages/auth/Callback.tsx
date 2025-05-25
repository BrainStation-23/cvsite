
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

const Callback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('Authentication successful, redirecting...');
          // Let the AuthContext handle the user setup
          // The useEffect in Login.tsx will handle the role-based redirect
          navigate('/login');
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error: any) {
        console.error('Unexpected callback error:', error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication",
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cvsite-navy to-cvsite-teal rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
    </div>
  );
};

export default Callback;
