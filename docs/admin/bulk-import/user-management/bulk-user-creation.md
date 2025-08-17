
# Bulk User Creation

## Overview
The bulk user creation feature allows administrators to create multiple user accounts simultaneously by uploading a CSV file. This process handles user authentication setup, profile creation, and role assignment.

## How It Works

### Process Flow
1. **File Upload**: Administrator uploads a CSV file
2. **CSV Parsing**: System parses the file using PapaParse library
3. **Data Validation**: Each row is validated against required fields and business rules
4. **Batch Processing**: Users are processed in batches of 50 to optimize performance
5. **Account Creation**: For each valid user:
   - Supabase Auth account is created
   - Profile record is inserted
   - User role is assigned
   - Password is generated (if not provided)

### Technical Implementation
- **Edge Function**: `supabase/functions/bulk-create-users/index.ts`
- **Frontend Hook**: `src/hooks/user-management/use-user-creation.ts`
- **Validation**: Real-time CSV validation with detailed error reporting

## Supported Fields

### Required Fields
- `email`: Valid email address (unique)
- `firstName`: User's first name (cannot be empty)

### Optional Fields
- `lastName`: User's last name
- `role`: User role (admin, manager, employee) - defaults to 'employee'
- `password`: Account password - auto-generated if not provided
- `employeeId`: Employee identifier
- `sbuId`: Strategic Business Unit ID
- `managerEmail`: Manager's email address
- `sbuName`: SBU name (human-readable)
- `expertiseName`: Expertise type name
- `resourceTypeName`: Resource type name
- `dateOfJoining`: Date of joining (flexible format)
- `careerStartDate`: Career start date (flexible format)

## Exception Handling

### Validation Errors (Pre-Processing)
When validation fails before processing begins:

**What Happens:**
- Processing is blocked until errors are fixed
- Detailed error report is displayed
- No user accounts are created

**Common Validation Errors:**
- Missing required fields (email, firstName)
- Invalid email format
- Duplicate emails in the same file
- Invalid role values
- Invalid date formats

**User Experience:**
- Red error indicators show problematic rows
- Specific error messages for each field
- Suggestions for fixing common issues
- No credits are consumed

### Processing Errors (During Creation)
When individual user creation fails during processing:

**What Happens:**
1. The failed user is skipped
2. Error details are logged
3. Processing continues with remaining users
4. Failed users are reported in the final summary

**Common Processing Errors:**
- Email already exists in system
- Database constraint violations
- Supabase Auth service errors
- Network connectivity issues
- Invalid foreign key references (SBU, manager, etc.)

**Error Details Captured:**
- User email/identifier
- Specific error message
- Error type (auth, database, validation)
- Timestamp of failure

**User Feedback:**
```javascript
// Example error response
{
  successful: [
    { email: "user1@example.com", userId: "123" },
    { email: "user2@example.com", userId: "456" }
  ],
  failed: [
    { 
      email: "user3@example.com", 
      error: "Email already exists",
      details: "A user with this email already exists in the system"
    }
  ]
}
```

### System Errors (Infrastructure)
When system-level failures occur:

**What Happens:**
- Entire batch processing stops
- Error is logged to console
- User receives error notification
- Partial results may be available

**Common System Errors:**
- Supabase service unavailable
- Database connection timeout
- Edge function timeout (>300 seconds)
- Memory limits exceeded
- Rate limiting triggered

**Recovery Actions:**
- Automatic retry for transient errors
- Detailed error logging for debugging
- Graceful degradation when possible
- Clear error messages for users

## Performance Considerations

### Batch Processing
- **Batch Size**: 50 users per batch
- **Concurrent Batches**: 1 (sequential processing)
- **Delay Between Batches**: 100ms to prevent rate limiting

### Memory Management
- Streaming CSV parsing to handle large files
- Garbage collection between batches
- Memory-efficient data structures

### Monitoring
- Real-time progress updates
- Processing time tracking
- Success/failure rate monitoring
- Resource usage metrics

## Best Practices

### Data Preparation
1. **Clean Your Data**: Remove empty rows and invalid characters
2. **Validate Emails**: Ensure all emails are properly formatted
3. **Check Duplicates**: Remove duplicate entries before upload
4. **Test Small**: Start with 10-20 users to validate your format

### Error Prevention
1. **Use Template**: Download the provided CSV template
2. **Required Fields**: Always include email and firstName
3. **Valid Roles**: Use only: admin, manager, employee
4. **Date Formats**: Use YYYY-MM-DD format for dates

### Troubleshooting
1. **Check Error Reports**: Review detailed error messages
2. **Fix and Retry**: Correct errors and re-upload failed records
3. **Contact Support**: For persistent system errors
4. **Monitor Performance**: Watch for timeout issues with large files

## Security Considerations

### Data Protection
- CSV files are processed in memory (not stored permanently)
- Sensitive data is handled securely
- Auto-generated passwords are cryptographically secure

### Access Control
- Only admin users can perform bulk user creation
- All actions are logged for audit purposes
- Rate limiting prevents abuse

### Validation
- Input sanitization prevents injection attacks
- Business rule validation ensures data integrity
- Foreign key validation prevents orphaned records
