import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User, UserRole, UserPermission, CustomRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Backward compatibility
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  // New permission-based methods (cached)
  hasModuleAccess: (moduleId: string) => boolean;
  hasSubModulePermission: (subModuleId: string, permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage') => boolean;
  hasRouteAccess: (routePath: string) => boolean;
  getUserPermissions: () => UserPermission[];
  // Real-time RPC-based permission methods for critical checks
  hasModuleAccessRealTime: (moduleId: string) => Promise<boolean>;
  hasSubModulePermissionRealTime: (subModuleId: string, permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage', targetSbuId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Use RPC function to get all user permissions in one call
      const { data: permissionsData, error: permissionsError } = await supabase
        .rpc('get_user_permissions', { _user_id: supabaseUser.id });

      if (permissionsError) {
        console.error('Error fetching user permissions:', permissionsError);
        
        // If user doesn't have permissions, this might be a new OAuth user
        if (permissionsError.code === 'PGRST301' || permissionsError.message?.includes('permission denied')) {
          console.log('No user permissions found - this might be a new OAuth user');
          setUser(null);
          return;
        }
        
        setUser(null);
        return;
      }

      // Get basic user role for backward compatibility
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, custom_role_id, sbu_context')
        .eq('user_id', supabaseUser.id)
        .single();

      // Get profile data for display information
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, employee_id, sbu_id')
        .eq('id', supabaseUser.id)
        .single();

      // Transform RPC permissions data to UserPermission interface
      const userPermissions: UserPermission[] = (permissionsData || []).map((p, index) => ({
        id: `permission_${index}`, // Generate ID since RPC doesn't return it
        role_id: roleData?.custom_role_id || `role_${index}`, // Use role data or generate
        module_id: `module_${index}`, // Generate since not returned by RPC
        module_name: p.module_name,
        sub_module_id: `sub_module_${index}`, // Generate since not returned by RPC
        sub_module_name: p.sub_module_name,
        permission_type: p.permission_type === 'write' ? 'create' : p.permission_type as 'create' | 'read' | 'update' | 'delete' | 'manage',
        sbu_restrictions: p.allowed_sbus || [],
        route_path: p.route_path,
        table_names: p.table_names
      }));

      // Extract custom role info from permissions data (first permission should have role info)
      const customRole: CustomRole | undefined = permissionsData && permissionsData.length > 0 ? {
        id: roleData?.custom_role_id || `role_${supabaseUser.id}`,
        name: permissionsData[0].role_name,
        description: '', // Not returned by RPC
        is_sbu_bound: permissionsData[0].is_sbu_bound || false,
        is_active: true,
        created_by: supabaseUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_system_role: false
      } : undefined;

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        first_name: profileData?.first_name || supabaseUser.user_metadata.first_name || supabaseUser.user_metadata.name?.split(' ')[0] || '',
        last_name: profileData?.last_name || supabaseUser.user_metadata.last_name || supabaseUser.user_metadata.name?.split(' ').slice(1).join(' ') || '',
        firstName: profileData?.first_name || supabaseUser.user_metadata.first_name || supabaseUser.user_metadata.name?.split(' ')[0] || '',
        lastName: profileData?.last_name || supabaseUser.user_metadata.last_name || supabaseUser.user_metadata.name?.split(' ').slice(1).join(' ') || '',
        employee_id: profileData?.employee_id,
        role: (roleData?.role as UserRole) || 'employee',
        profileImageUrl: supabaseUser.user_metadata.avatar_url || supabaseUser.user_metadata.picture || '/placeholder.svg',
        created_at: supabaseUser.created_at,
        updated_at: supabaseUser.updated_at || supabaseUser.created_at,
        // New permission-based fields
        customRole,
        sbuContext: roleData?.sbu_context || profileData?.sbu_id,
        permissions: userPermissions
      });
    } catch (error) {
      console.error('Error setting up user profile:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential callback deadlock
          setTimeout(() => {
            fetchUserProfile(currentSession.user);
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          setSession(initialSession);
          await fetchUserProfile(initialSession.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Auth state change listener will handle setting the user
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a valid session before attempting to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        // Only call signOut if we have a valid session
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase sign out error:', error);
          // Even if there's an error, we should clear the local state
        }
      } else {
        console.log('No active session found, clearing local state only');
      }
      
      // Always clear local state regardless of Supabase signOut result
      setSession(null);
      setUser(null);
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the local state
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Backward compatibility method
  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  // New permission-based methods - hybrid approach with cache + RPC fallback
  const hasModuleAccess = (moduleId: string): boolean => {
    console.log('=== hasModuleAccess Debug ===');
    console.log('Looking for module:', moduleId);
    console.log('User permissions:', user?.permissions?.map(p => ({
      module: p.module_name,
      subModule: p.sub_module_name,
      permission: p.permission_type
    })));
    
    if (!user?.permissions) {
      console.log('No user permissions found');
      return false;
    }
    
    // Use cached permissions for performance
    const hasAccess = user.permissions.some(permission => 
      permission.module_name === moduleId || permission.module_id === moduleId
    );
    
    console.log('Module access result:', hasAccess);
    console.log('=== End hasModuleAccess Debug ===');
    
    return hasAccess;
  };

  const hasSubModulePermission = (
    subModuleId: string, 
    permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage'
  ): boolean => {
    console.log('=== hasSubModulePermission Debug ===');
    console.log('Looking for sub-module:', subModuleId, 'with permission:', permissionType);
    console.log('Available sub-modules:', user?.permissions?.map(p => p.sub_module_name));
    
    if (!user?.permissions) {
      console.log('No user permissions found');
      return false;
    }
    
    // Use cached permissions with SBU restrictions already processed by RPC
    const hasAccess = user.permissions.some(permission => 
      (permission.sub_module_name === subModuleId || permission.sub_module_id === subModuleId) && 
      permission.permission_type === permissionType
    );
    
    console.log('Sub-module permission result:', hasAccess);
    console.log('=== End hasSubModulePermission Debug ===');
    
    return hasAccess;
  };

  const hasRouteAccess = (routePath: string): boolean => {
    if (!user?.permissions) return false;
    
    // Check if route matches any permission route paths
    const routePermission = user.permissions.find(permission => 
      permission.route_path === routePath
    );

    if (routePermission) {
      return routePermission.permission_type === 'read';
    }

    // Fallback: check for any read permission
    return user.permissions.some(permission => 
      permission.permission_type === 'read'
    );
  };

  const getUserPermissions = (): UserPermission[] => {
    return user?.permissions || [];
  };

  // Real-time RPC-based permission methods for critical security checks
  const hasModuleAccessRealTime = async (moduleId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('has_module_access', { 
          _user_id: user.id, 
          _module_name: moduleId 
        });
      
      if (error) {
        console.error('Error checking module access:', error);
        // Fallback to cached permissions on error
        return hasModuleAccess(moduleId);
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in hasModuleAccessRealTime:', error);
      return hasModuleAccess(moduleId);
    }
  };

  const hasSubModulePermissionRealTime = async (
    subModuleId: string, 
    permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage',
    targetSbuId?: string
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Convert 'create' to 'write' for the database function, filter out 'manage'
      const dbPermissionType = permissionType === 'create' ? 'write' : 
                               permissionType === 'manage' ? 'read' : permissionType;
      
      const { data, error } = await supabase
        .rpc('has_permission', {
          _user_id: user.id,
          _sub_module_path: subModuleId,
          _permission_type: dbPermissionType,
          _target_sbu_id: targetSbuId || user.sbuContext
        });
      
      if (error) {
        console.error('Error checking sub-module permission:', error);
        // Fallback to cached permissions on error
        return hasSubModulePermission(subModuleId, permissionType);
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in hasSubModulePermissionRealTime:', error);
      return hasSubModulePermission(subModuleId, permissionType);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        signIn, 
        signOut,
        hasPermission,
        hasModuleAccess,
        hasSubModulePermission,
        hasRouteAccess,
        getUserPermissions,
        hasModuleAccessRealTime,
        hasSubModulePermissionRealTime
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
