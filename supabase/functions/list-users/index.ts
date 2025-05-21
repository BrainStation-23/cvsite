
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
    
    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');
    
    // Calculate pagination parameters
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    // Get users from Supabase Auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      page, perPage
    });
    
    if (usersError) {
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the user roles for all users
    const userIds = users.map(user => user.id);
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);
    
    if (rolesError) {
      return new Response(
        JSON.stringify({ error: rolesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a map of user ID to role
    const roleMap = new Map();
    if (roles) {
      roles.forEach(role => {
        roleMap.set(role.user_id, role.role);
      });
    }
    
    // Combine users with their roles
    const usersWithRoles = users.map(user => {
      return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        role: roleMap.get(user.id) || 'unknown',
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at
      };
    });
    
    return new Response(
      JSON.stringify({ users: usersWithRoles }),
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
