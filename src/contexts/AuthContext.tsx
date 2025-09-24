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
  // New permission-based methods
  hasModuleAccess: (moduleId: string) => boolean;
  hasSubModulePermission: (subModuleId: string, permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage') => boolean;
  hasRouteAccess: (routePath: string) => boolean;
  getUserPermissions: () => UserPermission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user role and custom role information
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          custom_role_id,
          sbu_context,
          custom_roles!inner(
            id,
            name,
            description,
            is_sbu_bound,
            is_active
          )
        `)
        .eq('user_id', supabaseUser.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        
        // If user doesn't have a role, this might be a new OAuth user
        if (roleError.code === 'PGRST116') {
          console.log('No user role found - this might be a new OAuth user');
          setUser(null);
          return;
        }
        
        setUser(null);
        return;
      }

      const userRole = roleData.role as UserRole;
      const customRole = roleData.custom_roles as CustomRole;
      const sbuContext = roleData.sbu_context;

      // Get user permissions based on custom role
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          id,
          role_id,
          module_id,
          sub_module_id,
          permission_type_id,
          sbu_restrictions,
          modules!inner(
            id,
            name
          ),
          sub_modules(
            id,
            name
          ),
          permission_types!inner(
            id,
            name
          )
        `)
        .eq('role_id', roleData.custom_role_id);

      if (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
      }

      // Transform permissions data
      const userPermissions: UserPermission[] = (permissionsData || []).map(p => ({
        id: p.id,
        role_id: p.role_id,
        module_id: p.module_id,
        module_name: p.modules.name,
        sub_module_id: p.sub_module_id,
        sub_module_name: p.sub_modules?.name,
        permission_type: p.permission_types.name as 'create' | 'read' | 'update' | 'delete' | 'manage',
        sbu_restrictions: p.sbu_restrictions
      }));

      // Get profile data for display name and employee ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, employee_id, sbu_id')
        .eq('id', supabaseUser.id)
        .single();

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        first_name: profileData?.first_name || supabaseUser.user_metadata.first_name || supabaseUser.user_metadata.name?.split(' ')[0] || '',
        last_name: profileData?.last_name || supabaseUser.user_metadata.last_name || supabaseUser.user_metadata.name?.split(' ').slice(1).join(' ') || '',
        firstName: profileData?.first_name || supabaseUser.user_metadata.first_name || supabaseUser.user_metadata.name?.split(' ')[0] || '',
        lastName: profileData?.last_name || supabaseUser.user_metadata.last_name || supabaseUser.user_metadata.name?.split(' ').slice(1).join(' ') || '',
        employee_id: profileData?.employee_id,
        role: userRole,
        profileImageUrl: supabaseUser.user_metadata.avatar_url || supabaseUser.user_metadata.picture || '/placeholder.svg',
        created_at: supabaseUser.created_at,
        updated_at: supabaseUser.updated_at || supabaseUser.created_at,
        // New permission-based fields
        customRole,
        sbuContext: sbuContext || profileData?.sbu_id,
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

  // New permission-based methods
  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user?.permissions) return false;
    
    // Check if user has any permission for this module
    return user.permissions.some(permission => 
      permission.module_id === moduleId
    );
  };

  const hasSubModulePermission = (
    subModuleId: string, 
    permissionType: 'create' | 'read' | 'update' | 'delete' | 'manage'
  ): boolean => {
    if (!user?.permissions) return false;
    
    // Check if user has the specific permission for this sub-module
    const hasPermission = user.permissions.some(permission => 
      permission.sub_module_id === subModuleId && 
      (permission.permission_type === permissionType || permission.permission_type === 'manage')
    );

    if (!hasPermission) return false;

    // Check SBU restrictions if applicable
    const permission = user.permissions.find(p => 
      p.sub_module_id === subModuleId && 
      (p.permission_type === permissionType || p.permission_type === 'manage')
    );

    if (permission?.sbu_restrictions && permission.sbu_restrictions.length > 0) {
      // If there are SBU restrictions, check if user's SBU context is allowed
      return user.sbuContext ? permission.sbu_restrictions.includes(user.sbuContext) : false;
    }

    return true;
  };

  const hasRouteAccess = (routePath: string): boolean => {
    if (!user?.permissions) return false;
    
    // This could be enhanced to map routes to sub-modules
    // For now, we'll do a basic check for any read permission
    return user.permissions.some(permission => 
      permission.permission_type === 'read' || permission.permission_type === 'manage'
    );
  };

  const getUserPermissions = (): UserPermission[] => {
    return user?.permissions || [];
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
        getUserPermissions
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
