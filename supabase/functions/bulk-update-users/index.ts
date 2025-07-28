
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { parseCSVData } from "./csv-parser.ts";
import { processBatch } from "./batch-processor.ts";
import { UserUpdateData, ProcessingResult } from "./types.ts";

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

const handleChunkProcessing = async (supabase: any, users: UserUpdateData[]) => {
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
  
  const result: ProcessingResult = {
    message: `Processed ${users.length} users. ${allResults.successful.length} updated successfully, ${allResults.failed.length} failed.`,
    results: allResults,
    chunkInfo: {
      totalUsers: users.length,
      totalBatches: batches.length,
      batchSize: BATCH_SIZE
    }
  };
  
  return new Response(
    JSON.stringify(result),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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
      return await handleChunkProcessing(supabase, users);
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
