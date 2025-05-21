
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
      email: row[0],
      password: row[1],
      firstName: row[2],
      lastName: row[3],
      role: row[4]
    }));
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    const workbook = xlsx.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data.map((row: any) => ({
      email: row.email,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role
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
      const { email, password, firstName, lastName, role } = user;
      
      // Basic validation
      if (!email || !password || !firstName || !lastName || !role) {
        results.failed.push({ ...user, error: 'Missing required fields' });
        continue;
      }
      
      // Validate role
      if (!['admin', 'manager', 'employee'].includes(role)) {
        results.failed.push({ ...user, error: 'Invalid role. Must be admin, manager, or employee' });
        continue;
      }
      
      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
          }
        });
        
        if (authError) {
          results.failed.push({ ...user, error: authError.message });
          continue;
        }
        
        // Assign role to the user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: authData.user.id, role });
        
        if (roleError) {
          // Attempt to clean up by deleting the user if role assignment fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          results.failed.push({ ...user, error: roleError.message });
          continue;
        }
        
        results.successful.push({ 
          id: authData.user.id,
          email: authData.user.email,
          firstName,
          lastName,
          role
        });
      } catch (error) {
        results.failed.push({ ...user, error: error.message || 'Unknown error' });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${users.length} users. ${results.successful.length} added successfully, ${results.failed.length} failed.`,
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
