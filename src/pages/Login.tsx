
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
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

  const handleAzureLogin = async () => {
    try {
      setAzureLoading(true);
      // TODO: Implement Azure AD login
      toast({
        title: "Coming Soon",
        description: "Azure AD integration will be implemented soon",
        variant: "default"
      });
    } catch (error) {
      console.error('Azure login error:', error);
      toast({
        title: "Azure Login Failed",
        description: "Unable to authenticate with Microsoft Azure AD",
        variant: "destructive"
      });
    } finally {
      setAzureLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cvsite-navy/90 to-cvsite-teal/90 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1200&q=80"
          alt="Professional workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Welcome to CVSite</h1>
          <p className="text-xl leading-relaxed mb-8 max-w-md">
            Streamline your HR processes with our comprehensive employee management platform. 
            Manage profiles, track achievements, and build your organization's future.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="font-semibold">Human Resources Excellence</p>
              <p className="text-sm opacity-90">Empowering people, driving success</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-cvsite-navy dark:text-white mb-2">CVSite</h1>
            <p className="text-gray-600 dark:text-gray-400">Professional HR Management</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cvsite-navy to-cvsite-teal rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">CV</span>
              </div>
              <CardTitle className="text-2xl font-bold text-cvsite-navy dark:text-white">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Access your professional dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Azure AD Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                onClick={handleAzureLogin}
                disabled={azureLoading}
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H10V10H0V0Z" fill="#F25022"/>
                    <path d="M11 0H21V10H11V0Z" fill="#7FBA00"/>
                    <path d="M0 11H10V21H0V11Z" fill="#00A4EF"/>
                    <path d="M11 11H21V21H11V11Z" fill="#FFB900"/>
                  </svg>
                  <span className="font-medium">
                    {azureLoading ? "Connecting..." : "Continue with Microsoft"}
                  </span>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400 font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-cvsite-teal focus:ring-cvsite-teal"
                    placeholder="Enter your work email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10 border-gray-300 dark:border-gray-600 focus:border-cvsite-teal focus:ring-cvsite-teal"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-cvsite-navy to-cvsite-teal hover:from-cvsite-navy/90 hover:to-cvsite-teal/90 text-white font-medium transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure access to your professional profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 CVSite. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
