
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
    
    console.log('Fetching all users for export using list_users function...');
    
    // Use the list_users function that we know works correctly
    // Fetch all users by setting a high items_per_page value
    const { data: usersResponse, error: usersError } = await supabase.rpc('list_users', {
      search_query: null,
      filter_role: null,
      page_number: 1,
      items_per_page: 10000, // Large number to get all users
      sort_by: 'email',
      sort_order: 'asc'
    });
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }
    
    if (!usersResponse || !usersResponse.users) {
      return new Response(
        JSON.stringify({ error: 'No users found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const users = usersResponse.users;
    console.log(`Found ${users.length} users to export`);
    
    // Transform the data to match the bulk update CSV format
    const csvData = users.map(user => ({
      userId: user.id,
      email: user.email || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role || 'employee',
      employeeId: user.employee_id || '',
      password: '', // Empty password field for security
      sbuName: user.sbu_name || ''
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
