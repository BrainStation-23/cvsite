
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as csv from "https://deno.land/std@0.170.0/encoding/csv.ts";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 10; // Process users in batches of 10
const BATCH_DELAY = 2000; // 2 second delay between batches

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
      firstName: row[1],
      lastName: row[2],
      role: row[3] || 'employee',
      password: row[4],
      employeeId: row[5],
      sbuName: row[6] // Added SBU name field
    }));
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    const workbook = xlsx.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data.map((row: any) => ({
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role || 'employee',
      password: row.password,
      employeeId: row.employeeId,
      sbuName: row.sbuName // Added SBU name field
    }));
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel file.');
  }
};

const getSbuIdByName = async (supabase: any, sbuName: string): Promise<string | null> => {
  if (!sbuName || sbuName.trim() === '') return null;
  
  const { data: sbus, error } = await supabase
    .from('sbus')
    .select('id')
    .ilike('name', sbuName.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching SBU:', error);
    return null;
  }
  
  return sbus && sbus.length > 0 ? sbus[0].id : null;
};

const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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
    
    console.log(`Processing ${users.length} users in batches of ${BATCH_SIZE}`);
    
    const results = {
      successful: [],
      failed: [],
      passwordsGenerated: 0
    };
    
    const totalBatches = Math.ceil(users.length / BATCH_SIZE);
    let currentBatch = 0;
    
    // Process users in batches
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      currentBatch++;
      const batch = users.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${currentBatch}/${totalBatches} with ${batch.length} users`);
      
      // Process each user in the current batch
      for (const user of batch) {
        const { email, firstName, lastName, role, password, employeeId, sbuName } = user;
        
        if (!email || !firstName || !lastName) {
          results.failed.push({ 
            email: email || 'unknown', 
            error: 'Missing required fields: email, firstName, and lastName are required' 
          });
          continue;
        }
        
        try {
          // Validate role
          if (!['admin', 'manager', 'employee'].includes(role)) {
            results.failed.push({ email, error: 'Invalid role. Must be admin, manager, or employee' });
            continue;
          }
          
          // Generate password if not provided
          const userPassword = password && password.trim() ? password.trim() : generateRandomPassword();
          if (!password || !password.trim()) {
            results.passwordsGenerated++;
          }
          
          // Get SBU ID from name if provided
          let sbuId = null;
          if (sbuName && sbuName.trim()) {
            sbuId = await getSbuIdByName(supabase, sbuName);
            if (!sbuId) {
              console.log(`Warning: SBU "${sbuName}" not found for user ${email}, proceeding without SBU assignment`);
            }
          }
          
          console.log(`Creating user: ${email} with SBU: ${sbuName} (ID: ${sbuId})`);
          
          // Create user in Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password: userPassword,
            email_confirm: true,
            user_metadata: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              role: role,
              employee_id: employeeId ? employeeId.trim() : '',
              sbu_id: sbuId
            }
          });
          
          if (authError) {
            console.error(`Error creating user ${email}:`, authError);
            
            let errorMessage = authError.message;
            if (authError.message.includes('duplicate key') || authError.message.includes('already exists')) {
              errorMessage = 'A user with this email already exists';
            }
            
            results.failed.push({ email, error: errorMessage });
            continue;
          }
          
          if (!authData.user) {
            results.failed.push({ email, error: 'Failed to create user - no user data returned' });
            continue;
          }
          
          // Update the profile with SBU assignment if we found one
          if (sbuId) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ sbu_id: sbuId })
              .eq('id', authData.user.id);
            
            if (profileError) {
              console.error(`Error updating profile with SBU for user ${email}:`, profileError);
              // Don't fail the entire operation if SBU assignment fails
            }
          }
          
          results.successful.push({ 
            email, 
            userId: authData.user.id,
            sbuAssigned: !!sbuId,
            sbuName: sbuId ? sbuName : null
          });
          
          console.log(`Successfully created user: ${email}`);
        } catch (error) {
          console.error(`Error processing user ${email}:`, error);
          results.failed.push({ email, error: error.message || 'Unknown error' });
        }
      }
      
      // Add delay between batches (except for the last batch)
      if (currentBatch < totalBatches) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    console.log(`Bulk creation completed. Success: ${results.successful.length}, Failed: ${results.failed.length}`);
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${users.length} users in ${totalBatches} batches. ${results.successful.length} created successfully, ${results.failed.length} failed.`,
        results,
        batchInfo: {
          totalBatches,
          totalUsers: users.length,
          batchSize: BATCH_SIZE
        }
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
