
import { supabase } from '@/integrations/supabase/client';

export interface NameToIdMapping {
  expertiseId: string | null;
  managerId: string | null;
  resourceTypeId: string | null;
}

export const mapNamesToIds = async (
  expertiseName: string | null,
  managerName: string | null,
  resourceTypeName: string | null
): Promise<NameToIdMapping> => {
  console.log('=== mapNamesToIds Debug ===');
  console.log('Input - expertiseName:', expertiseName);
  console.log('Input - managerName:', managerName);
  console.log('Input - resourceTypeName:', resourceTypeName);

  const result: NameToIdMapping = {
    expertiseId: null,
    managerId: null,
    resourceTypeId: null
  };

  try {
    // Map expertise name to ID
    if (expertiseName) {
      const { data: expertiseData, error: expertiseError } = await supabase
        .from('expertise_types')
        .select('id')
        .eq('name', expertiseName)
        .single();
      
      if (expertiseError) {
        console.error('Error fetching expertise ID:', expertiseError);
      } else {
        result.expertiseId = expertiseData?.id || null;
        console.log('Found expertise ID:', result.expertiseId);
      }
    }

    // Map manager name to ID by searching profiles
    if (managerName) {
      // Split the manager name to search by first and last name
      const nameParts = managerName.trim().split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        console.log('Searching for manager - firstName:', firstName, 'lastName:', lastName);
        
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('first_name', firstName)
          .eq('last_name', lastName)
          .single();
        
        if (managerError) {
          console.error('Error fetching manager ID:', managerError);
          
          // Try alternative search in general_information table
          const { data: generalInfoData, error: generalInfoError } = await supabase
            .from('general_information')
            .select('profile_id')
            .eq('first_name', firstName)
            .eq('last_name', lastName)
            .single();
          
          if (generalInfoError) {
            console.error('Error fetching manager ID from general_information:', generalInfoError);
          } else {
            result.managerId = generalInfoData?.profile_id || null;
            console.log('Found manager ID from general_information:', result.managerId);
          }
        } else {
          result.managerId = managerData?.id || null;
          console.log('Found manager ID from profiles:', result.managerId);
        }
      }
    }

    // Map resource type name to ID
    if (resourceTypeName) {
      const { data: resourceTypeData, error: resourceTypeError } = await supabase
        .from('resource_types')
        .select('id')
        .eq('name', resourceTypeName)
        .single();
      
      if (resourceTypeError) {
        console.error('Error fetching resource type ID:', resourceTypeError);
      } else {
        result.resourceTypeId = resourceTypeData?.id || null;
        console.log('Found resource type ID:', result.resourceTypeId);
      }
    }

  } catch (error) {
    console.error('Error in mapNamesToIds:', error);
  }

  console.log('Final mapping result:', result);
  return result;
};
