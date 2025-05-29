
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FrontChannelLogout = () => {
  const { signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear the user's session if they are authenticated
        if (isAuthenticated) {
          await signOut();
        }
        
        // Redirect to login page after logout
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Front-channel logout error:', error);
        // Still redirect to login even if there's an error
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [signOut, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cvsite-navy to-cvsite-teal rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Signing out...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we sign you out of your account.
        </p>
      </div>
    </div>
  );
};

export default FrontChannelLogout;
