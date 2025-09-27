
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
          console.log('Authentication successful');
          
          // Check if this is a new user from OAuth (Microsoft)
          const user = data.session.user;
          if (user && user.app_metadata?.provider === 'azure') {
            // Check if user profile exists
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single();

            // If no profile exists, this is a new OAuth user - create profile with placeholder data
            if (!profile && profileError?.code === 'PGRST116') {
              console.log('New OAuth user detected, creating profile with placeholder data');
              
              // Extract names from user metadata or email
              const firstName = user.user_metadata?.first_name || 
                               user.user_metadata?.name?.split(' ')[0] || 
                               user.email?.split('@')[0] || 'New';
              const lastName = user.user_metadata?.last_name || 
                              user.user_metadata?.name?.split(' ').slice(1).join(' ') || 
                              'User';
              
              // Generate a placeholder employee ID
              const employeeId = `EMP${Date.now().toString().slice(-6)}`;

              try {
                // Create profile
                const { error: createProfileError } = await supabase
                  .from('profiles')
                  .insert({
                    id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    employee_id: employeeId
                  });

                if (createProfileError) {
                  console.error('Error creating profile:', createProfileError);
                }

                // Create user role
                const { error: createRoleError } = await supabase
                  .from('user_roles')
                  .insert({
                    user_id: user.id,
                    role: 'employee'
                  });

                if (createRoleError) {
                  console.error('Error creating user role:', createRoleError);
                }

                // Create general information with placeholder data
                const { error: createGeneralInfoError } = await supabase
                  .from('general_information')
                  .insert({
                    profile_id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    biography: 'Welcome to CVSite! Please update your profile information.',
                    profile_image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
                  });

                if (createGeneralInfoError) {
                  console.error('Error creating general information:', createGeneralInfoError);
                }

                toast({
                  title: "Welcome to CVSite!",
                  description: "Your account has been created. Please update your profile information.",
                });
              } catch (setupError) {
                console.error('Error setting up new user:', setupError);
                toast({
                  title: "Setup Warning",
                  description: "Account created but some profile setup may be incomplete. Please check your profile.",
                  variant: "destructive"
                });
              }
            }
          }
          
          // Redirect will be handled by AuthContext
          navigate('/login');
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error: unknown) {
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
          Please wait while we set up your account and redirect you to your dashboard.
        </p>
      </div>
    </div>
  );
};

export default Callback;
