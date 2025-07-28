
export const getSbuIdByName = async (supabase: any, sbuName: string): Promise<string | null> => {
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

export const getExpertiseIdByName = async (supabase: any, expertiseName: string): Promise<string | null> => {
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

export const getResourceTypeIdByName = async (supabase: any, resourceTypeName: string): Promise<string | null> => {
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

export const getManagerIdByEmail = async (supabase: any, managerEmail: string): Promise<string | null> => {
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
