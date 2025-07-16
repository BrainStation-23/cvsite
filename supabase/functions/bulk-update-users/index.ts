
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
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
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
        
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        
        const users = results.data
          .filter((row: any) => row.userId && row.userId.trim() !== '')
          .map((row: any) => ({
            userId: row.userId?.trim(),
            email: row.email?.trim(),
            firstName: row.firstName?.trim(),
            lastName: row.lastName?.trim() || undefined,
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

const parseAndValidateDate = (dateString: string): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    const date = new Date(dateString.trim());
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}. Setting to null.`);
      return null;
    }
    
    // Convert to YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn(`Error parsing date ${dateString}:`, error, 'Setting to null.');
    return null;
  }
};

const updateUserInBatch = async (supabase: any, user: UserUpdateData) => {
  console.log('Updating user:', user.userId);
  
  try {
    // Get foreign key IDs from names
    const sbuId = user.sbuName ? await getSbuIdByName(supabase, user.sbuName) : undefined;
    const expertiseId = user.expertiseName ? await getExpertiseIdByName(supabase, user.expertiseName) : undefined;
    const resourceTypeId = user.resourceTypeName ? await getResourceTypeIdByName(supabase, user.resourceTypeName) : undefined;
    const managerId = user.managerEmail ? await getManagerIdByEmail(supabase, user.managerEmail) : undefined;
    
    // Parse dates with validation - set to null if invalid
    const parsedDateOfJoining = user.dateOfJoining ? parseAndValidateDate(user.dateOfJoining) : null;
    const parsedCareerStartDate = user.careerStartDate ? parseAndValidateDate(user.careerStartDate) : null;
    
    // Update user auth data if needed
    if (user.email || user.firstName || user.lastName !== undefined || user.employeeId || user.password) {
      const updateData: Record<string, any> = {};
      
      if (user.email) updateData.email = user.email;
      if (user.password) updateData.password = user.password;
      
      const userMetadata: Record<string, any> = {};
      if (user.firstName) userMetadata.first_name = user.firstName;
      if (user.lastName !== undefined) userMetadata.last_name = user.lastName;
      if (user.employeeId) userMetadata.employee_id = user.employeeId;
      
      if (Object.keys(userMetadata).length > 0) {
        updateData.user_metadata = userMetadata;
      }
      
      if (Object.keys(updateData).length > 0) {
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
    if (user.lastName !== undefined) profileUpdates.last_name = user.lastName;
    if (user.employeeId) profileUpdates.employee_id = user.employeeId;
    if (sbuId !== undefined) profileUpdates.sbu_id = sbuId;
    if (expertiseId !== undefined) profileUpdates.expertise = expertiseId;
    if (resourceTypeId !== undefined) profileUpdates.resource_type = resourceTypeId;
    if (managerId !== undefined) profileUpdates.manager = managerId;
    if (parsedDateOfJoining) profileUpdates.date_of_joining = parsedDateOfJoining;
    if (parsedCareerStartDate) profileUpdates.career_start_date = parsedCareerStartDate;
    
    if (Object.keys(profileUpdates).length > 0) {
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
      
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', user.userId);
      
      if (fetchError) {
        throw new Error(`Role fetch failed: ${fetchError.message}`);
      }
      
      if (existingRoles && existingRoles.length > 0) {
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
      success: true
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
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if this is a chunk processing request or initial parsing
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // This is a chunk processing request
      const { users } = await req.json();
      
      if (!users || !Array.isArray(users)) {
        throw new Error('Invalid users data provided');
      }
      
      console.log(`Processing chunk with ${users.length} users`);
      
      // Process users in smaller batches
      const BATCH_SIZE = 10;
      const batches = [];
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        batches.push(users.slice(i, i + BATCH_SIZE));
      }
      
      const allResults = {
        successful: [] as any[],
        failed: [] as any[]
      };
      
      for (let i = 0; i < batches.length; i++) {
        const batchResults = await processBatch(supabase, batches[i], i + 1);
        allResults.successful.push(...batchResults.successful);
        allResults.failed.push(...batchResults.failed);
        
        // Small delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('Chunk processing completed:', {
        successful: allResults.successful.length,
        failed: allResults.failed.length,
        totalUsers: users.length
      });
      
      return new Response(
        JSON.stringify({ 
          message: `Processed ${users.length} users. ${allResults.successful.length} updated successfully, ${allResults.failed.length} failed.`,
          results: allResults,
          chunkInfo: {
            totalUsers: users.length,
            totalBatches: batches.length,
            batchSize: BATCH_SIZE
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // This is a CSV parsing request
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        throw new Error('No file uploaded');
      }
      
      console.log('Parsing CSV file:', file.name, 'Type:', file.type);
      
      const users = await parseCSVData(file);
      
      if (!users.length) {
        return new Response(
          JSON.stringify({ error: 'No valid users found in the file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`CSV parsed successfully: ${users.length} users found`);
      
      return new Response(
        JSON.stringify({ 
          message: `CSV parsed successfully. Found ${users.length} users ready for processing.`,
          users: users,
          totalUsers: users.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
