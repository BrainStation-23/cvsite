
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { HeroSection } from '../components/auth/HeroSection';
import { LoginForm } from '../components/auth/LoginForm';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user, navigate]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'manager':
        navigate('/manager/dashboard');
        break;
      case 'employee':
        navigate('/employee/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signIn(email, password);
      
      // Auth context will handle the redirect via the useEffect above
    } catch (err: any) {
      console.error('Login error:', err);
      toast({
        title: "Authentication failed",
        description: err.message || "Invalid email or password",
        variant: "destructive"
      });
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
