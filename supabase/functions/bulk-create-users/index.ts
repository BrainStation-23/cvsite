
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Papa from "https://esm.sh/papaparse@5.4.1";

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
  
  if (fileType === 'csv') {
    const text = new TextDecoder().decode(await file.arrayBuffer());
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${result.errors[0].message}`));
          } else {
            resolve(result.data);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  } else {
    throw new Error('Unsupported file format. Please upload CSV file.');
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

const getExpertiseIdByName = async (supabase: any, expertiseName: string): Promise<string | null> => {
  if (!expertiseName || expertiseName.trim() === '') return null;
  
  const { data: expertise, error } = await supabase
    .from('expertise_types')
    .select('id')
    .ilike('name', expertiseName.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching expertise:', error);
    return null;
  }
  
  return expertise && expertise.length > 0 ? expertise[0].id : null;
};

const getResourceTypeIdByName = async (supabase: any, resourceTypeName: string): Promise<string | null> => {
  if (!resourceTypeName || resourceTypeName.trim() === '') return null;
  
  const { data: resourceTypes, error } = await supabase
    .from('resource_types')
    .select('id')
    .ilike('name', resourceTypeName.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching resource type:', error);
    return null;
  }
  
  return resourceTypes && resourceTypes.length > 0 ? resourceTypes[0].id : null;
};

const getManagerIdByEmail = async (supabase: any, managerEmail: string): Promise<string | null> => {
  if (!managerEmail || managerEmail.trim() === '') return null;
  
  const { data: managers, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', managerEmail.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching manager:', error);
    return null;
  }
  
  return managers && managers.length > 0 ? managers[0].id : null;
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
        const { 
          email, 
          firstName, 
          lastName, 
          role, 
          password, 
          employeeId, 
          managerEmail,
          sbuName, 
          expertiseName, 
          resourceTypeName,
          dateOfJoining,
          careerStartDate,
          dateOfBirth,
          resignationDate,
          exitDate,
          active,
          hasOverhead
        } = user;
        
        if (!email || !firstName || !lastName) {
          results.failed.push({ 
            email: email || 'unknown', 
            error: 'Missing required fields: email, firstName, and lastName are required' 
          });
          continue;
        }
        
        try {
          // Validate role
          const validRole = role && ['admin', 'manager', 'employee'].includes(role.toLowerCase()) 
            ? role.toLowerCase() 
            : 'employee';
          
          // Generate password if not provided
          const userPassword = password && password.trim() ? password.trim() : generateRandomPassword();
          if (!password || !password.trim()) {
            results.passwordsGenerated++;
          }
          
          // Get foreign key IDs from names
          const sbuId = await getSbuIdByName(supabase, sbuName);
          const expertiseId = await getExpertiseIdByName(supabase, expertiseName);
          const resourceTypeId = await getResourceTypeIdByName(supabase, resourceTypeName);
          const managerId = await getManagerIdByEmail(supabase, managerEmail);
          
          // Parse dates
          const parsedDateOfJoining = dateOfJoining && dateOfJoining.trim() ? dateOfJoining.trim() : null;
          const parsedCareerStartDate = careerStartDate && careerStartDate.trim() ? careerStartDate.trim() : null;
          const parsedDateOfBirth = dateOfBirth && dateOfBirth.trim() ? dateOfBirth.trim() : null;
          const parsedResignationDate = resignationDate && resignationDate.trim() ? resignationDate.trim() : null;
          const parsedExitDate = exitDate && exitDate.trim() ? exitDate.trim() : null;
          
          // Parse booleans from CSV (they come as strings)
          const activeValue = active !== undefined ? (active === 'true' || active === true || active === 'TRUE' || active === '1') : true;
          const hasOverheadValue = hasOverhead !== undefined ? (hasOverhead === 'true' || hasOverhead === true || hasOverhead === 'TRUE' || hasOverhead === '1') : true;
          
          console.log(`Creating user: ${email} with SBU: ${sbuName} (ID: ${sbuId}), Manager: ${managerEmail} (ID: ${managerId})`);
          console.log(`User status: active=${activeValue}, hasOverhead=${hasOverheadValue}`);
          
          
          // Create user in Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password: userPassword,
            email_confirm: true,
            user_metadata: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              role: validRole,
              employee_id: employeeId ? employeeId.trim() : '',
              sbu_id: sbuId,
              expertise_id: expertiseId,
              resource_type_id: resourceTypeId,
              manager_id: managerId,
              date_of_joining: parsedDateOfJoining,
              career_start_date: parsedCareerStartDate,
              date_of_birth: parsedDateOfBirth,
              resignation_date: parsedResignationDate,
              exit_date: parsedExitDate,
              active: activeValue,
              has_overhead: hasOverheadValue
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
          
          // Update the profile with additional information
          const profileUpdates: any = {};
          if (sbuId) profileUpdates.sbu_id = sbuId;
          if (expertiseId) profileUpdates.expertise = expertiseId;
          if (resourceTypeId) profileUpdates.resource_type = resourceTypeId;
          if (managerId) profileUpdates.manager = managerId;
          if (parsedDateOfJoining) profileUpdates.date_of_joining = parsedDateOfJoining;
          if (parsedCareerStartDate) profileUpdates.career_start_date = parsedCareerStartDate;
          if (parsedDateOfBirth) profileUpdates.date_of_birth = parsedDateOfBirth;
          if (parsedResignationDate) profileUpdates.resignation_date = parsedResignationDate;
          if (parsedExitDate) profileUpdates.exit_date = parsedExitDate;
          if (active !== undefined) profileUpdates.active = activeValue;
          if (hasOverhead !== undefined) profileUpdates.has_overhead = hasOverheadValue;
          
          if (Object.keys(profileUpdates).length > 0) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update(profileUpdates)
              .eq('id', authData.user.id);
            
            if (profileError) {
              console.error(`Error updating profile for user ${email}:`, profileError);
              // Don't fail the entire operation if profile update fails
            }
          }
          
          results.successful.push({ 
            email, 
            userId: authData.user.id,
            sbuAssigned: !!sbuId,
            sbuName: sbuId ? sbuName : null,
            managerAssigned: !!managerId,
            managerEmail: managerId ? managerEmail : null,
            expertiseAssigned: !!expertiseId,
            expertiseName: expertiseId ? expertiseName : null,
            resourceTypeAssigned: !!resourceTypeId,
            resourceTypeName: resourceTypeId ? resourceTypeName : null
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
