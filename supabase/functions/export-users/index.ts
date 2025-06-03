
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as csv from "https://deno.land/std@0.170.0/encoding/csv.ts";

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
    
    console.log('Fetching all users for export...');
    
    // Fetch all users with their profile data, roles, and SBU information
    // Join through auth.users since that's what both profiles and user_roles reference
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        employee_id,
        sbus(name)
      `);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }
    
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${users.length} users, now fetching roles...`);
    
    // Fetch user roles separately since we can't join them directly
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw rolesError;
    }
    
    // Create a map of user_id to role for quick lookup
    const rolesMap = new Map();
    if (userRoles) {
      userRoles.forEach(ur => {
        rolesMap.set(ur.user_id, ur.role);
      });
    }
    
    // Transform the data to match the bulk update CSV format
    const csvData = users.map(user => ({
      userId: user.id,
      email: user.email || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: rolesMap.get(user.id) || 'employee',
      employeeId: user.employee_id || '',
      password: '', // Empty password field for security
      sbuName: user.sbus?.name || ''
    }));
    
    // Convert to CSV format
    const csvHeaders = ['userId', 'email', 'firstName', 'lastName', 'role', 'employeeId', 'password', 'sbuName'];
    const csvRows = csvData.map(row => [
      row.userId,
      row.email,
      row.firstName,
      row.lastName,
      row.role,
      row.employeeId,
      row.password,
      row.sbuName
    ]);
    
    const csvContent = csv.stringify([csvHeaders, ...csvRows]);
    
    console.log(`Successfully generated CSV with ${csvData.length} user records`);
    
    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users_export.csv"'
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
