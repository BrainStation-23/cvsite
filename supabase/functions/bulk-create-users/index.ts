
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Papa from "https://esm.sh/papaparse@5.4.1";

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

// Helper function to process users in batches
const processBatch = async (supabase: any, users: any[], batchIndex: number, batchSize: number) => {
  console.log(`Processing batch ${batchIndex + 1}, users ${batchIndex * batchSize + 1}-${Math.min((batchIndex + 1) * batchSize, users.length)}`);
  
  const results = {
    successful: [],
    failed: [],
    generatedPasswords: []
  };
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`Processing user ${batchIndex * batchSize + i + 1}: ${user.email}`);
    
    const { email, firstName, lastName, role, password, employeeId } = user;
    
    // Basic validation - email and firstName are required
    if (!email || !firstName) {
      console.log(`Validation failed for user: missing email or firstName`);
      results.failed.push({ 
        ...user, 
        error: 'Email and first name are required fields' 
      });
      continue;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log(`Invalid email format: ${email}`);
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
      console.log(`Creating user in Supabase Auth: ${email}`);
      
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
        console.error(`Auth error for ${email}:`, authError);
        results.failed.push({ ...user, error: authError.message });
        continue;
      }
      
      console.log(`Successfully created user: ${email}`);
      
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
      console.error(`Error processing user ${email}:`, error);
      results.failed.push({ ...user, error: error.message || 'Unknown error' });
    }
  }
  
  return results;
};

const parseFileData = async (formData: FormData): Promise<any[]> => {
  console.log('Starting file parsing with PapaParse...');
  const file = formData.get('file') as File;
  if (!file) {
    console.error('No file found in FormData');
    throw new Error('No file uploaded');
  }
  
  console.log('File found:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  const fileType = file.name.split('.').pop()?.toLowerCase();
  console.log('File type detected:', fileType);
  
  if (fileType !== 'csv') {
    throw new Error('Only CSV files are supported');
  }
  
  const text = await file.text();
  console.log('File content length:', text.length);
  console.log('First 200 chars:', text.substring(0, 200));
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('PapaParse results:', results);
        console.log('Parsed rows count:', results.data.length);
        
        if (results.errors && results.errors.length > 0) {
          console.error('PapaParse errors:', results.errors);
        }
        
        const users = results.data.map((row: any, index: number) => {
          console.log(`Row ${index}:`, row);
          return {
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role,
            password: row.password,
            employeeId: row.employeeId
          };
        });
        
        resolve(users);
      },
      error: (error) => {
        console.error('PapaParse error:', error);
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

serve(async (req) => {
  console.log('Function called with method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service key present:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the file from the request
    console.log('Parsing form data...');
    const formData = await req.formData();
    console.log('FormData entries:', Array.from(formData.keys()));
    
    const users = await parseFileData(formData);
    console.log('Users to process:', users.length);
    
    if (!users.length) {
      return new Response(
        JSON.stringify({ error: 'No valid users found in the file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process users in batches of 10
    const batchSize = 10;
    const totalBatches = Math.ceil(users.length / batchSize);
    console.log(`Processing ${users.length} users in ${totalBatches} batches of ${batchSize}`);
    
    const allResults = {
      successful: [],
      failed: [],
      generatedPasswords: []
    };
    
    // Process each batch sequentially to avoid overwhelming the system
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, users.length);
      const batchUsers = users.slice(startIndex, endIndex);
      
      console.log(`Starting batch ${batchIndex + 1}/${totalBatches}`);
      
      const batchResults = await processBatch(supabase, batchUsers, batchIndex, batchSize);
      
      // Merge results
      allResults.successful.push(...batchResults.successful);
      allResults.failed.push(...batchResults.failed);
      allResults.generatedPasswords.push(...batchResults.generatedPasswords);
      
      console.log(`Completed batch ${batchIndex + 1}/${totalBatches}. Successful: ${batchResults.successful.length}, Failed: ${batchResults.failed.length}`);
      
      // Add a small delay between batches to prevent rate limiting
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('All batches processed. Final results:', {
      successful: allResults.successful.length,
      failed: allResults.failed.length,
      passwordsGenerated: allResults.generatedPasswords.length
    });
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${users.length} users in ${totalBatches} batches. ${allResults.successful.length} added successfully, ${allResults.failed.length} failed.`,
        results: allResults,
        passwordsGenerated: allResults.generatedPasswords.length,
        batchInfo: {
          totalBatches,
          batchSize,
          totalUsers: users.length
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
