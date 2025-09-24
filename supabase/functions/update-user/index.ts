
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
      userId, 
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
      careerStartDate, 
      managerId,
      dateOfBirth,
      resignationDate,
      exitDate,
      active,
      hasOverhead,
      password 
    } = await req.json();
    
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
      if (customRoleId !== undefined) userMetadata.custom_role_id = customRoleId;
      if (sbuContext !== undefined) userMetadata.sbu_context = sbuContext;
      if (sbuId !== undefined) userMetadata.sbu_id = sbuId;
      if (expertiseId !== undefined) userMetadata.expertise_id = expertiseId;
      if (resourceTypeId !== undefined) userMetadata.resource_type_id = resourceTypeId;
      if (dateOfJoining !== undefined) userMetadata.date_of_joining = dateOfJoining;
      if (careerStartDate !== undefined) userMetadata.career_start_date = careerStartDate;
      if (managerId !== undefined) userMetadata.manager = managerId;
      
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
    if (firstName || lastName || employeeId || sbuId !== undefined || expertiseId !== undefined || resourceTypeId !== undefined || dateOfJoining !== undefined || careerStartDate !== undefined || managerId !== undefined || dateOfBirth !== undefined || resignationDate !== undefined || exitDate !== undefined || active !== undefined || hasOverhead !== undefined) {
      const profileUpdates: Record<string, any> = {};
      if (firstName) profileUpdates.first_name = firstName;
      if (lastName) profileUpdates.last_name = lastName;
      if (employeeId) profileUpdates.employee_id = employeeId;
      if (sbuId !== undefined) profileUpdates.sbu_id = sbuId;
      if (expertiseId !== undefined) profileUpdates.expertise = expertiseId;
      if (resourceTypeId !== undefined) profileUpdates.resource_type = resourceTypeId;
      if (dateOfJoining !== undefined) profileUpdates.date_of_joining = dateOfJoining;
      if (careerStartDate !== undefined) profileUpdates.career_start_date = careerStartDate;
      if (managerId !== undefined) profileUpdates.manager = managerId;
      if (dateOfBirth !== undefined) profileUpdates.date_of_birth = dateOfBirth;
      if (resignationDate !== undefined) profileUpdates.resignation_date = resignationDate;
      if (exitDate !== undefined) profileUpdates.exit_date = exitDate;
      if (active !== undefined) profileUpdates.active = active;
      if (hasOverhead !== undefined) profileUpdates.has_overhead = hasOverhead;
      
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
    
    // Update custom role if provided
    if (customRoleId !== undefined) {
      if (customRoleId) {
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

        // Assign new custom role
        const { error: roleAssignError } = await supabase
          .rpc('assign_custom_role_to_user', {
            _user_id: userId,
            _custom_role_id: customRoleId,
            _sbu_context: sbuContext,
            _assigned_by: null // Will use auth.uid() in function
          });
        
        if (roleAssignError) {
          return new Response(
            JSON.stringify({ error: roleAssignError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Remove existing role if customRoleId is explicitly set to null
        const { error: removeRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        if (removeRoleError) {
          return new Response(
            JSON.stringify({ error: removeRoleError.message }),
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
