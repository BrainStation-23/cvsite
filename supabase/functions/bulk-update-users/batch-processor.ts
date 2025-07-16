
import { UserUpdateData, ChunkResult } from "./types.ts";
import { updateUserInBatch } from "./user-updater.ts";

export const processBatch = async (supabase: any, batch: UserUpdateData[], batchNumber: number): Promise<ChunkResult> => {
  console.log(`Processing batch ${batchNumber} with ${batch.length} users`);
  
  const results: ChunkResult = {
    successful: [],
    failed: []
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
