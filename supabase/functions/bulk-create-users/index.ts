
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as csv from "https://deno.land/std@0.170.0/encoding/csv.ts";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate a random password
const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Helper function to validate and format role
const formatUserRole = (role: string): string => {
  if (!role || typeof role !== 'string') return 'employee';
  
  const lowerRole = role.toLowerCase().trim();
  switch (lowerRole) {
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'employee':
    case '':
      return 'employee';
    default:
      return 'employee';
  }
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
      firstName: row[1],
      lastName: row[2],
      role: row[3],
      password: row[4],
      employeeId: row[5]
    }));
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    const workbook = xlsx.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data.map((row: any) => ({
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      password: row.password,
      employeeId: row.employeeId
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
      failed: [],
      generatedPasswords: []
    };
    
    // Process each user
    for (const user of users) {
      const { email, firstName, lastName, role, password, employeeId } = user;
      
      // Basic validation - email and firstName are required
      if (!email || !firstName) {
        results.failed.push({ 
          ...user, 
          error: 'Email and first name are required fields' 
        });
        continue;
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        results.failed.push({ 
          ...user, 
          error: 'Invalid email format' 
        });
        continue;
      }
      
      // Format role and generate password if needed
      const formattedRole = formatUserRole(role);
      const finalPassword = password && password.trim() ? password.trim() : generateRandomPassword();
      const passwordWasGenerated = !password || !password.trim();
      
      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email.trim(),
          password: finalPassword,
          email_confirm: true,
          user_metadata: {
            first_name: firstName.trim(),
            last_name: lastName ? lastName.trim() : '',
            role: formattedRole,
            employee_id: employeeId ? employeeId.trim() : ''
          }
        });
        
        if (authError) {
          results.failed.push({ ...user, error: authError.message });
          continue;
        }
        
        const successfulUser = { 
          id: authData.user.id,
          email: authData.user.email,
          firstName: firstName.trim(),
          lastName: lastName ? lastName.trim() : '',
          role: formattedRole,
          employeeId: employeeId ? employeeId.trim() : ''
        };
        
        results.successful.push(successfulUser);
        
        // Track generated passwords for reporting
        if (passwordWasGenerated) {
          results.generatedPasswords.push({
            email: email.trim(),
            password: finalPassword
          });
        }
      } catch (error) {
        results.failed.push({ ...user, error: error.message || 'Unknown error' });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${users.length} users. ${results.successful.length} added successfully, ${results.failed.length} failed.`,
        results,
        passwordsGenerated: results.generatedPasswords.length
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
