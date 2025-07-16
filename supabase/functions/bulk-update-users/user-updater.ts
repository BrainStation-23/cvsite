
import { UserUpdateData } from "./types.ts";
import { getSbuIdByName, getExpertiseIdByName, getResourceTypeIdByName, getManagerIdByEmail } from "./lookup-helpers.ts";
import { parseAndValidateDate } from "./date-utils.ts";

export const updateUserInBatch = async (supabase: any, user: UserUpdateData) => {
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
