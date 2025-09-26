
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
    
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      customRoleId,
      sbuContext,
      employeeId, 
      sbuId, 
      expertiseId, 
      resourceTypeId,
      dateOfJoining, 
      careerStartDate 
    } = await req.json();
    
    console.log('Creating user with data:', { 
      email, 
      firstName, 
      lastName, 
      customRoleId,
      sbuContext, 
      employeeId, 
      sbuId, 
      expertiseId, 
      resourceTypeId,
      dateOfJoining, 
      careerStartDate 
    });
    
    if (!email || !password || !firstName || !lastName || !customRoleId || !employeeId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, firstName, lastName, customRoleId, and employeeId are all required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate custom role assignment
    const { data: validRole, error: roleValidationError } = await supabase
      .rpc('validate_custom_role_assignment', {
        _custom_role_id: customRoleId,
        _sbu_context: sbuContext
      });

    if (roleValidationError || !validRole) {
      return new Response(
        JSON.stringify({ error: 'Invalid custom role assignment or SBU context mismatch' }),
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
        custom_role_id: customRoleId,
        sbu_context: sbuContext,
        employee_id: employeeId,
        sbu_id: sbuId,
        expertise_id: expertiseId,
        resource_type_id: resourceTypeId,
        date_of_joining: dateOfJoining,
        career_start_date: careerStartDate
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
    
    // Update the profile with additional fields
    const profileUpdates: any = {};
    if (sbuId) profileUpdates.sbu_id = sbuId;
    if (expertiseId) profileUpdates.expertise = expertiseId;
    if (resourceTypeId) profileUpdates.resource_type = resourceTypeId;
    if (dateOfJoining) profileUpdates.date_of_joining = dateOfJoining;
    if (careerStartDate) profileUpdates.career_start_date = careerStartDate;
    
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Error updating profile with additional fields:', profileError);
        // Don't fail the entire operation if profile update fails
      }
    }
    
    // Assign custom role to user
    const { error: roleAssignError } = await supabase
      .rpc('assign_custom_role_to_user', {
        _user_id: authData.user.id,
        _custom_role_id: customRoleId,
        _sbu_context: sbuContext,
        _assigned_by: null // Will use auth.uid() in function
      });
    
    if (roleAssignError) {
      console.error('Error assigning custom role:', roleAssignError);
      // Don't fail the entire operation if role assignment fails
    }
    
    console.log('User created successfully with custom role:', authData.user.id);
    
    return new Response(
      JSON.stringify({ 
        message: 'User created successfully', 
        user: { 
          id: authData.user.id,
          email: authData.user.email,
          firstName,
          lastName,
          customRoleId,
          sbuContext,
          employeeId,
          sbuId,
          expertiseId,
          resourceTypeId,
          dateOfJoining,
          careerStartDate
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
