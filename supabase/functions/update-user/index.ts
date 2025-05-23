
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId, email, firstName, lastName, role, employeeId, password } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update user metadata if provided
    if (firstName || lastName || email || password) {
      const userMetadata: Record<string, any> = {};
      if (firstName) userMetadata.first_name = firstName;
      if (lastName) userMetadata.last_name = lastName;
      if (employeeId) userMetadata.employee_id = employeeId;
      
      const updateData: Record<string, any> = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (Object.keys(userMetadata).length > 0) {
        updateData.user_metadata = userMetadata;
      }
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        updateData
      );
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Update profile table if profile-related fields are provided
    if (firstName || lastName || employeeId) {
      const profileUpdates: Record<string, any> = {};
      if (firstName) profileUpdates.first_name = firstName;
      if (lastName) profileUpdates.last_name = lastName;
      if (employeeId) profileUpdates.employee_id = employeeId;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
      
      if (profileError) {
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Update role if provided
    if (role) {
      // Validate role
      if (!['admin', 'manager', 'employee'].includes(role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid role. Must be admin, manager, or employee' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // First get the existing role to see if we need to update
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', userId);
      
      if (fetchError) {
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (existingRoles && existingRoles.length > 0) {
        // User has roles, update if different
        const existingRole = existingRoles[0];
        if (existingRole.role !== role) {
          const { error: updateRoleError } = await supabase
            .from('user_roles')
            .update({ role })
            .eq('id', existingRole.id);
          
          if (updateRoleError) {
            return new Response(
              JSON.stringify({ error: updateRoleError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } else {
        // No roles found, insert new role
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (insertRoleError) {
          return new Response(
            JSON.stringify({ error: insertRoleError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    return new Response(
      JSON.stringify({ message: 'User updated successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
