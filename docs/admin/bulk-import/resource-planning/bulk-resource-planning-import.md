
# Bulk Resource Planning Import

## Overview
The bulk resource planning import feature allows administrators to create multiple resource planning assignments simultaneously using CSV files. This streamlines the process of allocating employees to projects and managing resource capacity.

## How It Works

### Process Flow
1. **CSV Template Download**: Download standardized template with required columns
2. **File Upload**: CSV file is uploaded and parsed using PapaParse
3. **Data Validation**: Each row is validated against business rules and constraints
4. **Batch Processing**: Valid records are processed in batches to optimize performance
5. **Assignment Creation**: For each valid record:
   - Employee and project are verified
   - Resource allocation is calculated
   - Assignment record is created
   - Capacity tracking is updated

### Technical Implementation
- **Frontend Component**: `src/components/resource-planning/BulkResourcePlanningImport.tsx`
- **Import Hook**: `src/hooks/use-bulk-resource-planning-import.ts`
- **CSV Validation**: `src/utils/bulkResourcePlanningCsvUtils.ts`
- **Progress Tracking**: Real-time progress monitoring with error reporting

## Supported Fields

### Required Fields
- `employeeId`: Valid employee identifier (must exist in system)
- `projectName`: Project name (must exist in system)
- `startDate`: Assignment start date (YYYY-MM-DD format)
- `endDate`: Assignment end date (YYYY-MM-DD format)
- `allocationPercentage`: Resource allocation (1-100)

### Optional Fields
- `role`: Employee role in project
- `notes`: Additional assignment notes
- `priority`: Assignment priority level (Low, Medium, High)
- `billableHours`: Estimated billable hours
- `estimatedEffort`: Total effort estimation

## Exception Handling

### CSV Validation Errors (Pre-Processing)
When CSV parsing or validation fails:

**What Happens:**
- Processing is completely blocked
- Detailed validation report displays problematic rows
- No resource assignments are created
- User must fix all errors before proceeding

**Common Validation Errors:**
1. **Missing Required Fields**
   - Error: "Employee ID is required"
   - Row: Highlighted with specific field missing
   - Action: User must provide all required data

2. **Invalid Date Formats**
   - Error: "Start date must be in YYYY-MM-DD format"
   - Value: Shows the problematic date value
   - Action: User must correct date format

3. **Invalid Allocation Percentage**
   - Error: "Allocation percentage must be between 1 and 100"
   - Value: Shows invalid percentage value
   - Action: User must provide valid percentage

4. **Date Range Validation**
   - Error: "End date must be after start date"
   - Row: Shows conflicting date values
   - Action: User must correct date sequence

**Validation Error Structure:**
```javascript
{
  valid: [], // No valid records until errors are fixed
  errors: [
    {
      row: 3,
      field: "employeeId", 
      message: "Employee ID 'EMP999' does not exist in system",
      value: "EMP999"
    },
    {
      row: 5,
      field: "allocationPercentage",
      message: "Allocation percentage must be between 1 and 100", 
      value: "150"
    }
  ]
}
```

### Processing Errors (During Import)
When individual assignments fail during creation:

**What Happens:**
1. Failed assignment is logged with detailed error information
2. Processing continues with remaining assignments
3. Error details are added to failure report
4. Successful assignments are still created

**Common Processing Errors:**

**Employee Validation Failures:**
- Employee ID not found in database
- Employee is inactive or terminated
- Employee already assigned to conflicting project
- Employee lacks required skills for project

**Project Validation Failures:**
- Project name does not exist
- Project is closed or cancelled
- Project capacity already fully allocated
- Project dates conflict with assignment dates

**Resource Conflict Errors:**
- Employee over-allocated (total allocation > 100%)
- Conflicting assignment dates
- Insufficient project budget
- Resource constraint violations

**Database Constraint Errors:**
- Duplicate assignment records
- Foreign key constraint violations
- Database connection timeouts
- Transaction rollback failures

**Error Handling Implementation:**
```javascript
const processImport = async (validRecords) => {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const record of validRecords) {
    try {
      await createResourceAssignment(record);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        employeeId: record.employeeId,
        projectName: record.projectName,
        error: error.message,
        details: error.details || 'Unknown error'
      });
    }
  }

  return results;
};
```

### Batch Processing Errors
When entire batches fail to process:

**What Happens:**
1. Batch processing stops for current batch
2. All records in failed batch are marked as errors
3. Processing attempts to continue with next batch
4. System logs detailed batch failure information

**Common Batch Errors:**
- Database connection pool exhaustion
- Transaction timeout errors
- Memory limits exceeded during batch processing
- Concurrent modification conflicts

**Batch Error Recovery:**
```javascript
try {
  const batchResults = await processBatch(batchRecords);
  aggregateResults(batchResults);
} catch (batchError) {
  // Mark entire batch as failed
  const batchErrors = batchRecords.map(record => ({
    employeeId: record.employeeId,
    projectName: record.projectName,
    error: `Batch processing failed: ${batchError.message}`
  }));
  
  results.errors.push(...batchErrors);
  results.failed += batchRecords.length;
}
```

### System-Level Errors
When infrastructure or system failures occur:

**What Happens:**
- Complete import process terminates
- All progress is lost (no partial commits)
- Detailed system error is logged
- User receives error notification with support guidance

**Common System Errors:**
- Database service unavailable
- Application server timeout
- Memory allocation failures
- Network connectivity issues
- Security service authentication failures

## Performance Optimization

### Batch Processing Strategy
- **Optimal Batch Size**: 50-100 records per batch
- **Sequential Processing**: Prevents database lock conflicts
- **Progress Monitoring**: Real-time progress updates
- **Memory Management**: Efficient data structure usage

### Database Optimization
- **Connection Pooling**: Efficient database connection management
- **Transaction Batching**: Multiple inserts per transaction
- **Index Utilization**: Optimized queries for lookups
- **Constraint Checking**: Deferred constraint validation

### Error Recovery Mechanisms
- **Automatic Retry**: Transient error retry logic
- **Partial Import Support**: Resume from failure point
- **Error Export**: Download failed records for fixing
- **Rollback Capability**: Undo partial imports if needed

## Data Validation Rules

### Business Logic Validation
1. **Employee Availability**: Check existing assignments and capacity
2. **Project Capacity**: Ensure project can accommodate new assignments
3. **Date Conflicts**: Validate against existing resource commitments
4. **Skill Matching**: Verify employee skills match project requirements
5. **Budget Constraints**: Check project budget availability

### Data Integrity Checks
1. **Referential Integrity**: Validate all foreign key relationships
2. **Constraint Compliance**: Ensure all database constraints are met
3. **Duplicate Prevention**: Check for duplicate assignments
4. **Temporal Consistency**: Validate date ranges and sequences

## Error Reporting & Recovery

### Comprehensive Error Reports
Error reports include:
- **Row Numbers**: Exact location of problematic data
- **Field Names**: Specific fields with errors
- **Error Messages**: Clear, actionable error descriptions
- **Suggested Fixes**: Guidance on resolving common errors

### Error Export Functionality
- **CSV Download**: Export failed records with error details
- **Error Categorization**: Group errors by type for efficient fixing
- **Retry Support**: Re-import fixed records without duplicating successful ones

### Progress Monitoring
Real-time progress display:
- **Overall Progress**: Percentage completion
- **Batch Progress**: Current batch processing status
- **Success/Failure Counts**: Live counts of processed records
- **Error Accumulation**: Running total of error types

## Best Practices

### Data Preparation
1. **Use Provided Template**: Download and use the standard CSV template
2. **Validate Employee IDs**: Verify all employee IDs exist before import
3. **Check Project Names**: Ensure all project names are current and active
4. **Review Allocations**: Verify allocation percentages sum correctly
5. **Date Consistency**: Use consistent date formats (YYYY-MM-DD)

### Error Prevention Strategies
1. **Data Cleanup**: Remove empty rows and invalid characters
2. **Incremental Testing**: Test with small data sets first
3. **Cross-Reference Validation**: Verify data against current system state
4. **Backup Planning**: Maintain backup of original assignments

### Import Optimization
1. **Batch Size Management**: Keep batches to reasonable sizes (50-100 records)
2. **Off-Peak Processing**: Schedule large imports during low-usage periods
3. **Network Stability**: Ensure stable internet connection
4. **Browser Resources**: Close unnecessary applications during import

## Security & Compliance

### Data Security
- **Input Sanitization**: All CSV data is sanitized to prevent injection attacks
- **Access Control**: Only authorized users can perform bulk imports
- **Audit Logging**: All import activities are logged for compliance
- **Data Encryption**: Sensitive data is encrypted in transit and at rest

### Compliance Considerations
- **Data Privacy**: Personal information handling follows privacy regulations
- **Audit Trails**: Complete tracking of all import operations
- **Change Management**: Proper approval workflows for bulk changes
- **Backup Requirements**: Automated backups before bulk operations

### Error Handling Security
- **Error Sanitization**: Error messages don't expose sensitive system information
- **Rate Limiting**: Prevents abuse through excessive import attempts
- **Session Management**: Secure session handling during long-running imports
- **Input Validation**: Comprehensive validation prevents malicious data injection
