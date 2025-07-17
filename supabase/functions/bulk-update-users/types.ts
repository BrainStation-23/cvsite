
export interface UserUpdateData {
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

export interface ChunkResult {
  successful: any[];
  failed: any[];
}

export interface ProcessingResult {
  message: string;
  results: ChunkResult;
  chunkInfo: {
    totalUsers: number;
    totalBatches: number;
    batchSize: number;
  };
}
