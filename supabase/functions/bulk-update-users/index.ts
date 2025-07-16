
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Papa from "https://esm.sh/papaparse@5.4.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserUpdateData {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  employeeId?: string;
  password?: string;
  managerEmail?: string;
  sbuName?: string;
  expertiseName?: string;
  resourceTypeName?: string;
  dateOfJoining?: string;
  careerStartDate?: string;
}

const parseCSVData = async (file: File): Promise<UserUpdateData[]> => {
  console.log('Parsing CSV file:', file.name, 'Size:', file.size);
  
  const text = await file.text();
  console.log('CSV text length:', text.length);
  console.log('First 200 chars:', text.substring(0, 200));
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize headers to match expected field names
        const normalized = header.trim().toLowerCase();
        const headerMap: Record<string, string> = {
          'userid': 'userId',
          'user_id': 'userId',
          'id': 'userId',
          'firstname': 'firstName',
          'first_name': 'firstName',
          'lastname': 'lastName',
          'last_name': 'lastName',
          'employeeid': 'employeeId',
          'employee_id': 'employeeId',
          'manageremail': 'managerEmail',
          'manager_email': 'managerEmail',
          'sbuname': 'sbuName',
          'sbu_name': 'sbuName',
          'expertisename': 'expertiseName',
          'expertise_name': 'expertiseName',
          'resourcetypename': 'resourceTypeName',
          'resource_type_name': 'resourceTypeName',
          'dateofjoining': 'dateOfJoining',
          'date_of_joining': 'dateOfJoining',
          'careerstartdate': 'careerStartDate',
          'career_start_date': 'careerStartDate'
        };
        return headerMap[normalized] || header;
      },
      complete: (results) => {
        console.log('Parse complete. Rows:', results.data.length);
        console.log('Parse errors:', results.errors);
        
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        
        const users = results.data
          .filter((row: any) => row.userId && row.userId.trim() !== '')
          .map((row: any) => ({
            userId: row.userId?.trim(),
            email: row.email?.trim(),
            firstName: row.firstName?.trim(),
            lastName: row.lastName?.trim() || undefined, // Handle optional lastName
            role: row.role?.trim(),
            employeeId: row.employeeId?.trim(),
            password: row.password?.trim(),
            managerEmail: row.managerEmail?.trim(),
            sbuName: row.sbuName?.trim(),
            expertiseName: row.expertiseName?.trim(),
            resourceTypeName: row.resourceTypeName?.trim(),
            dateOfJoining: row.dateOfJoining?.trim(),
            careerStartDate: row.careerStartDate?.trim()
          }));
        
        console.log('Filtered users count:', users.length);
        console.log('Sample user:', users[0]);
        
        resolve(users);
      },
      error: (error) => {
        console.error('Papa parse error:', error);
        reject(error);
      }
    });
  });
};

const getSbuIdByName = async (supabase: any, sbuName: string): Promise<string | null> => {
  if (!sbuName || sbuName.trim() === '') return null;
  
  console.log('Looking up SBU:', sbuName);
  
  const { data: sbus, error } = await supabase
    .from('sbus')
    .select('id')
    .ilike('name', sbuName.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching SBU:', error);
    return null;
  }
  
  const sbuId = sbus && sbus.length > 0 ? sbus[0].id : null;
  console.log('SBU lookup result:', { sbuName, sbuId });
  
  return sbuId;
};

const getExpertiseIdByName = async (supabase: any, expertiseName: string): Promise<string | null> => {
  if (!expertiseName || expertiseName.trim() === '') return null;
  
  console.log('Looking up expertise:', expertiseName);
  
  const { data: expertise, error } = await supabase
    .from('expertise_types')
    .select('id')
    .ilike('name', expertiseName.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching expertise:', error);
    return null;
  }
  
  const expertiseId = expertise && expertise.length > 0 ? expertise[0].id : null;
  console.log('Expertise lookup result:', { expertiseName, expertiseId });
  
  return expertiseId;
};

const getResourceTypeIdByName = async (supabase: any, resourceTypeName: string): Promise<string | null> => {
  if (!resourceTypeName || resourceTypeName.trim() === '') return null;
  
  console.log('Looking up resource type:', resourceTypeName);
  
  const { data: resourceTypes, error } = await supabase
    .from('resource_types')
    .select('id')
    .ilike('name', resourceTypeName.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching resource type:', error);
    return null;
  }
  
  const resourceTypeId = resourceTypes && resourceTypes.length > 0 ? resourceTypes[0].id : null;
  console.log('Resource type lookup result:', { resourceTypeName, resourceTypeId });
  
  return resourceTypeId;
};

const getManagerIdByEmail = async (supabase: any, managerEmail: string): Promise<string | null> => {
  if (!managerEmail || managerEmail.trim() === '') return null;
  
  console.log('Looking up manager by email:', managerEmail);
  
  const { data: managers, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', managerEmail.trim())
    .limit(1);
  
  if (error) {
    console.error('Error fetching manager:', error);
    return null;
  }
  
  const managerId = managers && managers.length > 0 ? managers[0].id : null;
  console.log('Manager lookup result:', { managerEmail, managerId });
  
  return managerId;
};

const updateUserInBatch = async (supabase: any, user: UserUpdateData) => {
  console.log('Updating user:', user.userId);
  
  try {
    // Get foreign key IDs from names
    const sbuId = user.sbuName ? await getSbuIdByName(supabase, user.sbuName) : undefined;
    const expertiseId = user.expertiseName ? await getExpertiseIdByName(supabase, user.expertiseName) : undefined;
    const resourceTypeId = user.resourceTypeName ? await getResourceTypeIdByName(supabase, user.resourceTypeName) : undefined;
    const managerId = user.managerEmail ? await getManagerIdByEmail(supabase, user.managerEmail) : undefined;
    
    // Warn about missing lookups
    if (user.sbuName && !sbuId) {
      console.log(`Warning: SBU "${user.sbuName}" not found for user ${user.userId}`);
    }
    if (user.expertiseName && !expertiseId) {
      console.log(`Warning: Expertise "${user.expertiseName}" not found for user ${user.userId}`);
    }
    if (user.resourceTypeName && !resourceTypeId) {
      console.log(`Warning: Resource type "${user.resourceTypeName}" not found for user ${user.userId}`);
    }
    if (user.managerEmail && !managerId) {
      console.log(`Warning: Manager "${user.managerEmail}" not found for user ${user.userId}`);
    }
    
    // Parse dates - now more flexible
    const parsedDateOfJoining = user.dateOfJoining && user.dateOfJoining.trim() ? user.dateOfJoining.trim() : null;
    const parsedCareerStartDate = user.careerStartDate && user.careerStartDate.trim() ? user.careerStartDate.trim() : null;
    
    // Update user auth data if needed
    if (user.email || user.firstName || user.lastName || user.employeeId || user.password) {
      const updateData: Record<string, any> = {};
      
      if (user.email) updateData.email = user.email;
      if (user.password) updateData.password = user.password;
      
      const userMetadata: Record<string, any> = {};
      if (user.firstName) userMetadata.first_name = user.firstName;
      if (user.lastName) userMetadata.last_name = user.lastName; // Optional
      if (user.employeeId) userMetadata.employee_id = user.employeeId;
      
      if (Object.keys(userMetadata).length > 0) {
        updateData.user_metadata = userMetadata;
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('Updating auth user:', user.userId, updateData);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.userId,
          updateData
        );
        
        if (updateError) {
          throw new Error(`Auth update failed: ${updateError.message}`);
        }
      }
    }
    
    // Update profile table
    const profileUpdates: Record<string, any> = {};
    if (user.firstName) profileUpdates.first_name = user.firstName;
    if (user.lastName !== undefined) profileUpdates.last_name = user.lastName; // Handle optional lastName properly
    if (user.employeeId) profileUpdates.employee_id = user.employeeId;
    if (sbuId !== undefined) profileUpdates.sbu_id = sbuId;
    if (expertiseId !== undefined) profileUpdates.expertise = expertiseId;
    if (resourceTypeId !== undefined) profileUpdates.resource_type = resourceTypeId;
    if (managerId !== undefined) profileUpdates.manager = managerId;
    if (parsedDateOfJoining) profileUpdates.date_of_joining = parsedDateOfJoining;
    if (parsedCareerStartDate) profileUpdates.career_start_date = parsedCareerStartDate;
    
    if (Object.keys(profileUpdates).length > 0) {
      console.log('Updating profile:', user.userId, profileUpdates);
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.userId);
      
      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }
    }
    
    // Update role if provided
    if (user.role) {
      if (!['admin', 'manager', 'employee'].includes(user.role.toLowerCase())) {
        throw new Error('Invalid role. Must be admin, manager, or employee');
      }
      
      const validRole = user.role.toLowerCase();
      console.log('Updating role for user:', user.userId, 'to:', validRole);
      
      // Check existing roles
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', user.userId);
      
      if (fetchError) {
        throw new Error(`Role fetch failed: ${fetchError.message}`);
      }
      
      if (existingRoles && existingRoles.length > 0) {
        // Update existing role
        const existingRole = existingRoles[0];
        if (existingRole.role !== validRole) {
          const { error: updateRoleError } = await supabase
            .from('user_roles')
            .update({ role: validRole })
            .eq('id', existingRole.id);
          
          if (updateRoleError) {
            throw new Error(`Role update failed: ${updateRoleError.message}`);
          }
        }
      } else {
        // Insert new role
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.userId, role: validRole });
        
        if (insertRoleError) {
          throw new Error(`Role insert failed: ${insertRoleError.message}`);
        }
      }
    }
    
    console.log('Successfully updated user:', user.userId);
    return {
      userId: user.userId,
      sbuAssigned: !!sbuId,
      sbuName: sbuId ? user.sbuName : null,
      managerAssigned: !!managerId,
      managerEmail: managerId ? user.managerEmail : null,
      expertiseAssigned: !!expertiseId,
      expertiseName: expertiseId ? user.expertiseName : null,
      resourceTypeAssigned: !!resourceTypeId,
      resourceTypeName: resourceTypeId ? user.resourceTypeName : null
    };
  } catch (error) {
    console.error('Error updating user:', user.userId, error);
    throw error;
  }
};

const processBatch = async (supabase: any, batch: UserUpdateData[], batchNumber: number) => {
  console.log(`Processing batch ${batchNumber} with ${batch.length} users`);
  
  const results = {
    successful: [] as any[],
    failed: [] as any[]
  };
  
  for (const user of batch) {
    try {
      const result = await updateUserInBatch(supabase, user);
      results.successful.push(result);
    } catch (error) {
      console.error(`Failed to update user ${user.userId}:`, error);
      results.failed.push({ 
        userId: user.userId, 
        error: error.message || 'Unknown error' 
      });
    }
  }
  
  console.log(`Batch ${batchNumber} complete:`, {
    successful: results.successful.length,
    failed: results.failed.length
  });
  
  return results;
};

serve(async (req) => {
  console.log('Bulk update users function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    console.log('Processing file:', file.name, 'Type:', file.type);
    
    // Parse CSV using papaparse
    const users = await parseCSVData(file);
    
    if (!users.length) {
      return new Response(
        JSON.stringify({ error: 'No valid users found in the file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Starting bulk update for ${users.length} users`);
    
    // Process users in batches of 10
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      batches.push(users.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} users each`);
    
    const allResults = {
      successful: [] as any[],
      failed: [] as any[]
    };
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await processBatch(supabase, batches[i], i + 1);
      allResults.successful.push(...batchResults.successful);
      allResults.failed.push(...batchResults.failed);
      
      // Small delay between batches to avoid overwhelming the database
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const batchInfo = {
      totalUsers: users.length,
      totalBatches: batches.length,
      batchSize: BATCH_SIZE
    };
    
    console.log('Bulk update completed:', {
      successful: allResults.successful.length,
      failed: allResults.failed.length,
      batchInfo
    });
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${users.length} users. ${allResults.successful.length} updated successfully, ${allResults.failed.length} failed.`,
        results: allResults,
        batchInfo
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
