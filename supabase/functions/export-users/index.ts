
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
    
    console.log('Fetching all users with complete profile information for export...');
    
    // Use the list_users function to get all users with their profile information
    const { data: usersResponse, error: usersError } = await supabase.rpc('list_users', {
      search_query: null,
      filter_custom_role_id: null,
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
    
    // Transform the data to be human-friendly - now we have direct access to IDs and names
    const csvData = users.map(user => ({
      userId: user.id,
      email: user.email || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      customRoleName: user.custom_role_name || '',
      employeeId: user.employee_id || '',
      managerEmail: user.manager_email || '',
      sbuName: user.sbu_name || '',
      expertiseName: user.expertise_name || '',
      resourceTypeName: user.resource_type_name || '',
      dateOfJoining: user.date_of_joining || '',
      careerStartDate: user.career_start_date || '',
      dateOfBirth: user.date_of_birth || '',
      resignationDate: user.resignation_date || '',
      exitDate: user.exit_date || '',
      active: user.active !== undefined ? user.active : true,
      hasOverhead: user.has_overhead !== undefined ? user.has_overhead : true,
      createdAt: user.created_at || '',
      lastSignIn: user.last_sign_in_at || ''
    }));
    
    // Convert to CSV format with human-friendly headers
    const csvHeaders = [
      'userId', 'email', 'firstName', 'lastName', 'customRoleName', 
      'employeeId', 'managerEmail', 'sbuName', 'expertiseName', 'resourceTypeName', 
      'dateOfJoining', 'careerStartDate', 'dateOfBirth', 'resignationDate', 
      'exitDate', 'active', 'hasOverhead', 'createdAt', 'lastSignIn'
    ];
    
    const csvRows = csvData.map(row => [
      row.userId,
      row.email,
      row.firstName,
      row.lastName,
      row.customRoleName,
      row.employeeId,
      row.managerEmail,
      row.sbuName,
      row.expertiseName,
      row.resourceTypeName,
      row.dateOfJoining,
      row.careerStartDate,
      row.dateOfBirth,
      row.resignationDate,
      row.exitDate,
      row.active,
      row.hasOverhead,
      row.createdAt,
      row.lastSignIn
    ]);
    
    const csvContent = csv.stringify([csvHeaders, ...csvRows]);
    
    console.log(`Successfully generated CSV with ${csvData.length} user records including all profile information`);
    
    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users_complete_export.csv"'
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
