
# Bulk User Updates

## Overview
The bulk user updates feature allows administrators to modify existing user accounts in large quantities using CSV files. This uses a chunked processing approach to handle large datasets efficiently.

## How It Works

### Process Flow
1. **File Upload & Parsing**: CSV file is parsed using PapaParse
2. **Data Validation**: Each row is validated for required fields and data integrity
3. **Chunked Processing**: Data is split into chunks of 250 users
4. **Sequential Processing**: Each chunk is processed sequentially to prevent system overload
5. **User Updates**: For each valid user:
   - User authentication data is updated
   - Profile information is modified
   - Role assignments are updated
   - Foreign key relationships are resolved

### Technical Implementation
- **Edge Function**: `supabase/functions/bulk-update-users/index.ts`
- **Frontend Hook**: `src/hooks/use-chunked-bulk-update.ts`
- **Batch Processor**: `supabase/functions/bulk-update-users/batch-processor.ts`
- **CSV Parser**: `supabase/functions/bulk-update-users/csv-parser.ts`

## Supported Fields

### Required Fields
- `userId`: Existing user ID (must exist in system)

### Optional Update Fields
- `email`: New email address
- `firstName`: Updated first name
- `lastName`: Updated last name
- `role`: New role (admin, manager, employee)
- `password`: New password (leave empty to keep current)
- `employeeId`: Updated employee identifier
- `managerEmail`: Manager's email (resolved to manager ID)
- `sbuName`: SBU name (resolved to SBU ID)
- `expertiseName`: Expertise name (resolved to expertise ID)
- `resourceTypeName`: Resource type name (resolved to resource type ID)
- `dateOfJoining`: Updated joining date
- `careerStartDate`: Updated career start date

## Exception Handling

### Validation Errors (Pre-Processing)
When validation fails during CSV parsing:

**What Happens:**
- Processing is completely blocked
- Detailed validation report is shown
- No user updates are attempted
- User must fix errors before proceeding

**Common Validation Errors:**
- Missing userId field
- Invalid userId format
- Malformed email addresses
- Invalid role values
- Unparseable date formats

**Error Response Structure:**
```javascript
{
  valid: [], // No valid records
  errors: [
    {
      row: 2,
      field: "userId",
      message: "User ID is required for updates",
      value: ""
    }
  ]
}
```

### Processing Errors (During Updates)
When individual user updates fail during processing:

**What Happens:**
1. Failed user update is logged with detailed error
2. Processing continues with remaining users in the batch
3. Error is added to the failed results array
4. Other users in the chunk continue processing

**Common Processing Errors:**
- User not found (invalid userId)
- Email already exists (when updating email)
- Invalid foreign key references (manager, SBU, etc.)
- Database constraint violations
- Authentication service errors

**Error Handling Flow:**
```javascript
// In batch-processor.ts
for (const user of batch) {
  try {
    const result = await updateUserInBatch(supabase, user);
    results.successful.push(result);
  } catch (error) {
    results.failed.push({ 
      userId: user.userId, 
      error: error.message || 'Unknown error' 
    });
  }
}
```

**Detailed Error Types:**
1. **Auth Update Errors**: Supabase authentication failures
2. **Profile Update Errors**: Database constraint violations
3. **Role Update Errors**: Invalid role assignments
4. **Lookup Errors**: Foreign key resolution failures

### Chunk Processing Errors
When an entire chunk fails to process:

**What Happens:**
1. Chunk processing is marked as failed
2. All users in that chunk are marked as failed
3. Error details are logged
4. Processing continues with next chunk
5. User receives notification of chunk failure

**Common Chunk Errors:**
- Database connection timeout
- Memory exhaustion
- Edge function timeout
- Network connectivity issues

**Recovery Mechanism:**
```javascript
try {
  const chunkResult = await processUserChunk(chunk);
  // Process successful result
} catch (chunkError) {
  // Mark all users in chunk as failed
  const chunkErrors = chunk.map((user) => ({
    userId: user.userId,
    error: `Chunk processing failed: ${chunkError.message}`
  }));
  allResults.failed.push(...chunkErrors);
}
```

### System-Level Errors
When the entire import process fails:

**What Happens:**
- All processing stops immediately
- Error is logged to console and user interface
- Partial results are preserved and reported
- User receives system error notification

**Common System Errors:**
- Supabase service unavailable
- Edge function deployment issues
- Rate limiting exceeded
- Memory limits reached

## Performance Optimization

### Chunked Processing Strategy
- **Chunk Size**: 250 users per chunk
- **Processing Mode**: Sequential (not parallel)
- **Inter-chunk Delay**: 1 second between chunks
- **Batch Size within Chunks**: 10 users per batch

### Memory Management
- Efficient data structures to minimize memory usage
- Garbage collection between chunks
- Streaming approach for large datasets

### Progress Tracking
Real-time updates include:
- Current chunk being processed
- Total chunks to process
- Users processed vs. total users
- Success/failure counts
- Estimated time remaining

## Error Reporting & Recovery

### Error Aggregation
All errors are collected and categorized:
- Validation errors (pre-processing)
- Individual user errors (during processing)
- Chunk-level errors (system issues)
- Summary statistics

### Error Export
Failed records can be exported as CSV for:
- Easy identification of problematic data
- Bulk fixes and re-import
- Audit trail maintenance

### Retry Mechanisms
- **Automatic Retries**: For transient network errors
- **Manual Retry**: Users can fix errors and re-import failed records
- **Partial Import**: Successfully processed users remain updated

## Best Practices

### Data Preparation
1. **Validate User IDs**: Ensure all userIds exist in the system
2. **Backup Data**: Keep original data before bulk updates
3. **Test with Small Batches**: Start with 10-50 users
4. **Clean Data**: Remove empty rows and invalid characters

### Error Prevention
1. **Use Current Data**: Export current user data as reference
2. **Validate Foreign Keys**: Ensure manager emails, SBU names exist
3. **Check Email Uniqueness**: Avoid duplicate email conflicts
4. **Date Format Consistency**: Use standard date formats

### Monitoring & Troubleshooting
1. **Watch Progress**: Monitor real-time progress updates
2. **Review Error Reports**: Analyze failed record details
3. **Check System Status**: Monitor for performance issues
4. **Gradual Import**: Split very large datasets across multiple sessions

## Security & Compliance

### Data Validation
- Input sanitization prevents injection attacks
- Business rule validation ensures data integrity
- Foreign key validation prevents orphaned records

### Audit Trail
- All update operations are logged
- Error details are preserved for analysis
- User activity tracking for compliance

### Access Control
- Only authorized administrators can perform bulk updates
- Rate limiting prevents system abuse
- Secure file handling and processing
