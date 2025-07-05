
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
    
    const { email, password, firstName, lastName, role, employeeId, sbuId } = await req.json();
    
    console.log('Creating user with data:', { email, firstName, lastName, role, employeeId, sbuId });
    
    if (!email || !password || !firstName || !lastName || !role || !employeeId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, firstName, lastName, role, and employeeId are all required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate role
    if (!['admin', 'manager', 'employee'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be admin, manager, or employee' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create user in Supabase Auth - the trigger will handle profile and role creation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        employee_id: employeeId,
        sbu_id: sbuId
      }
    });
    
    if (authError) {
      console.error('Error creating user:', authError);
      
      // Provide more specific error messages
      let errorMessage = authError.message;
      if (authError.message.includes('duplicate key') || authError.message.includes('already exists')) {
        errorMessage = 'A user with this email already exists';
      } else if (authError.message.includes('Database error')) {
        errorMessage = 'Database error occurred while creating user. Please try again.';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!authData.user) {
      console.error('No user data returned from auth creation');
      return new Response(
        JSON.stringify({ error: 'Failed to create user - no user data returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the profile with SBU assignment if provided
    if (sbuId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ sbu_id: sbuId })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Error updating profile with SBU:', profileError);
        // Don't fail the entire operation if SBU assignment fails
      }
    }
    
    console.log('User created successfully by trigger:', authData.user.id);
    
    return new Response(
      JSON.stringify({ 
        message: 'User created successfully', 
        user: { 
          id: authData.user.id,
          email: authData.user.email,
          firstName,
          lastName,
          role,
          employeeId,
          sbuId
        } 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
