
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as csv from "https://deno.land/std@0.170.0/encoding/csv.ts";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parseFileData = async (formData: FormData): Promise<any[]> => {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file uploaded');
  
  const fileType = file.name.split('.').pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  
  if (fileType === 'csv') {
    const text = new TextDecoder().decode(arrayBuffer);
    const rows = await csv.parse(text, { skipFirstRow: true });
    return rows.map(row => ({
      userId: row[0],
      email: row[1],
      firstName: row[2],
      lastName: row[3],
      role: row[4],
      password: row[5] // Optional
    }));
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    const workbook = xlsx.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data.map((row: any) => ({
      userId: row.userId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      password: row.password // Optional
    }));
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel file.');
  }
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
    
    // Parse the file from the request
    const formData = await req.formData();
    const users = await parseFileData(formData);
    
    if (!users.length) {
      return new Response(
        JSON.stringify({ error: 'No valid users found in the file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results = {
      successful: [],
      failed: []
    };
    
    // Process each user
    for (const user of users) {
      const { userId, email, firstName, lastName, role, password } = user;
      
      if (!userId) {
        results.failed.push({ ...user, error: 'User ID is required' });
        continue;
      }
      
      try {
        // Update user metadata if provided
        if (email || firstName || lastName || password) {
          const updateData: Record<string, any> = {};
          
          if (email) updateData.email = email;
          if (password) updateData.password = password;
          
          const userMetadata: Record<string, any> = {};
          if (firstName) userMetadata.first_name = firstName;
          if (lastName) userMetadata.last_name = lastName;
          
          if (Object.keys(userMetadata).length > 0) {
            updateData.user_metadata = userMetadata;
          }
          
          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              userId,
              updateData
            );
            
            if (updateError) {
              results.failed.push({ userId, error: updateError.message });
              continue;
            }
          }
        }
        
        // Update role if provided
        if (role) {
          // Validate role
          if (!['admin', 'manager', 'employee'].includes(role)) {
            results.failed.push({ userId, error: 'Invalid role. Must be admin, manager, or employee' });
            continue;
          }
          
          // First get the existing role to see if we need to update
          const { data: existingRoles, error: fetchError } = await supabase
            .from('user_roles')
            .select('id, role')
            .eq('user_id', userId);
          
          if (fetchError) {
            results.failed.push({ userId, error: fetchError.message });
            continue;
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
                results.failed.push({ userId, error: updateRoleError.message });
                continue;
              }
            }
          } else {
            // No roles found, insert new role
            const { error: insertRoleError } = await supabase
              .from('user_roles')
              .insert({ user_id: userId, role });
            
            if (insertRoleError) {
              results.failed.push({ userId, error: insertRoleError.message });
              continue;
            }
          }
        }
        
        results.successful.push(userId);
      } catch (error) {
        results.failed.push({ userId, error: error.message || 'Unknown error' });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${users.length} users. ${results.successful.length} updated successfully, ${results.failed.length} failed.`,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
