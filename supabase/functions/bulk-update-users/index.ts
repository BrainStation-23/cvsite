
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { parseCSVData } from "./csv-parser.ts";
import { UserUpdateData } from "./types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handleCSVParsing = async (file: File) => {
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
};

const handleBulkProcessing = async (supabase: any, users: UserUpdateData[]) => {
  if (!users || !Array.isArray(users)) {
    throw new Error('Invalid users data provided');
  }
  
  console.log(`Processing ${users.length} users using RPC function`);
  
  try {
    // Call the RPC function for bulk processing
    const { data, error } = await supabase.rpc('bulk_update_users', {
      users_data: users
    });
    
    if (error) {
      console.error('RPC function error:', error);
      throw error;
    }
    
    console.log('Bulk processing completed:', data);
    
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in bulk processing:', error);
    throw error;
  }
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
      // This is a bulk processing request
      const { users } = await req.json();
      return await handleBulkProcessing(supabase, users);
    } else {
      // This is a CSV parsing request
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        throw new Error('No file uploaded');
      }
      
      return await handleCSVParsing(file);
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
