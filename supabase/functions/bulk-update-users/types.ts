
export interface UserUpdateData {
  userId: string;
  firstName?: string;
  lastName?: string;
  customRoleId?: string;
  customRoleName?: string;
  sbuContextId?: string;
  sbuContextName?: string;
  employeeId?: string;
  managerEmail?: string;
  sbuName?: string;
  expertiseName?: string;
  resourceTypeName?: string;
  dateOfJoining?: string;
  careerStartDate?: string;
  dateOfBirth?: string;
  resignationDate?: string;
  exitDate?: string;
  active?: boolean;
  hasOverhead?: boolean;
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
