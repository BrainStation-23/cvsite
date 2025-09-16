
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { HeroSection } from '../components/auth/HeroSection';
import { LoginForm } from '../components/auth/LoginForm';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      // If redirected from a protected route, go back there
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signIn(email, password);
      
      // Auth context will handle the redirect via the useEffect above
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <HeroSection />
      
      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 lg:px-12">
        <LoginForm onSubmit={handleSignIn} loading={loading} />
      </div>
    </div>
  );
};

export default Login;
