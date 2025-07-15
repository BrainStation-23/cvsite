
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
    
    // Get additional lookup data for human-friendly names
    const { data: sbuData } = await supabase.from('sbus').select('id, name');
    const { data: expertiseData } = await supabase.from('expertise_types').select('id, name');
    const { data: resourceTypeData } = await supabase.from('resource_types').select('id, name');
    
    // Create lookup maps for faster access
    const sbuMap = new Map(sbuData?.map(sbu => [sbu.id, sbu.name]) || []);
    const expertiseMap = new Map(expertiseData?.map(exp => [exp.id, exp.name]) || []);
    const resourceTypeMap = new Map(resourceTypeData?.map(rt => [rt.id, rt.name]) || []);
    
    // Get manager emails for all users who have managers
    const managerIds = users
      .filter(user => user.manager_id)
      .map(user => user.manager_id);
    
    let managerMap = new Map();
    if (managerIds.length > 0) {
      const { data: managerData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', managerIds);
      
      managerMap = new Map(managerData?.map(manager => [manager.id, manager.email]) || []);
    }
    
    // Transform the data to be human-friendly
    const csvData = users.map(user => ({
      userId: user.id,
      email: user.email || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role || 'employee',
      employeeId: user.employee_id || '',
      managerEmail: user.manager_id ? (managerMap.get(user.manager_id) || '') : '',
      sbuName: user.sbu_id ? (sbuMap.get(user.sbu_id) || '') : '',
      expertiseName: user.expertise_id ? (expertiseMap.get(user.expertise_id) || '') : '',
      resourceTypeName: user.resource_type_id ? (resourceTypeMap.get(user.resource_type_id) || '') : '',
      dateOfJoining: user.date_of_joining || '',
      careerStartDate: user.career_start_date || '',
      createdAt: user.created_at || '',
      updatedAt: user.updated_at || ''
    }));
    
    // Convert to CSV format with human-friendly headers
    const csvHeaders = [
      'userId', 'email', 'firstName', 'lastName', 'role', 'employeeId', 
      'managerEmail', 'sbuName', 'expertiseName', 'resourceTypeName', 
      'dateOfJoining', 'careerStartDate', 'createdAt', 'updatedAt'
    ];
    
    const csvRows = csvData.map(row => [
      row.userId,
      row.email,
      row.firstName,
      row.lastName,
      row.role,
      row.employeeId,
      row.managerEmail,
      row.sbuName,
      row.expertiseName,
      row.resourceTypeName,
      row.dateOfJoining,
      row.careerStartDate,
      row.createdAt,
      row.updatedAt
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
