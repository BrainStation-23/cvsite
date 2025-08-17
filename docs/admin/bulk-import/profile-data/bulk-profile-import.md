
# Bulk Profile Import

## Overview
The bulk profile import feature allows administrators to import comprehensive profile data using JSON files. This supports complex nested data structures including experiences, education, skills, projects, and achievements.

## How It Works

### Process Flow
1. **File Upload**: JSON file is uploaded via drag-and-drop or file selection
2. **Data Validation**: JSON structure is validated against expected schema
3. **Data Migration**: Legacy formats are automatically migrated to current schema
4. **Server-Side Processing**: Profile data is processed using RPC functions
5. **Comprehensive Import**: All profile sections are imported in sequence:
   - General Information
   - Technical Skills
   - Specialized Skills
   - Work Experiences
   - Education
   - Training & Certifications
   - Achievements
   - Projects

### Technical Implementation
- **Frontend Component**: `src/components/profile/importExport/ServerSideImportControls.tsx`
- **RPC Hook**: `src/hooks/profile/use-profile-json-rpc.ts`
- **Data Processing**: Server-side RPC functions handle complex data structures
- **Validation Service**: `src/services/profile/ProfileJSONService.ts`

## Supported Data Structure

### JSON Schema
```json
{
  "generalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "profileImage": "string (URL)",
    "biography": "string",
    "dateOfBirth": "string (ISO date)",
    "nationality": "string",
    "currentDesignation": "string"
  },
  "technicalSkills": [
    {
      "name": "string",
      "proficiency": "number (1-10)",
      "category": "string"
    }
  ],
  "specializedSkills": [
    {
      "name": "string",
      "proficiency": "number (1-10)",
      "category": "string"
    }
  ],
  "experiences": [
    {
      "companyName": "string",
      "designation": "string",
      "startDate": "string (ISO date)",
      "endDate": "string (ISO date)",
      "description": "string",
      "technologiesUsed": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "university": "string",
      "department": "string",
      "startDate": "string (ISO date)",
      "endDate": "string (ISO date)",
      "cgpa": "number"
    }
  ],
  "trainings": [
    {
      "title": "string",
      "provider": "string",
      "completionDate": "string (ISO date)",
      "certificateUrl": "string (URL)"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "description": "string",
      "date": "string (ISO date)",
      "category": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologiesUsed": "string",
      "responsibility": "string",
      "startDate": "string (ISO date)",
      "endDate": "string (ISO date)"
    }
  ]
}
```

### Legacy Format Support
The system automatically migrates older formats:
- `personalInfo` → `generalInfo` (backward compatibility)
- Different date formats are normalized
- Missing fields are handled gracefully

## Exception Handling

### File Validation Errors (Pre-Processing)
When JSON file validation fails:

**What Happens:**
- Import is blocked immediately
- Detailed error message is shown
- No data processing occurs
- User must fix file before retry

**Common Validation Errors:**
- Invalid JSON syntax
- Missing required fields
- Incorrect data types
- Malformed date formats
- Invalid URL formats

**Error Response:**
```javascript
{
  success: false,
  error: "Invalid JSON format: Unexpected token at position 156"
}
```

### Data Processing Errors (During Import)
When individual sections fail during processing:

**What Happens:**
1. Failed section is skipped
2. Error is logged with section details
3. Other sections continue processing
4. Final report shows which sections succeeded/failed

**Section-Specific Error Handling:**

**General Information Errors:**
- Required field validation
- Date parsing errors
- Image URL validation
- Database constraint violations

**Skills Errors:**
- Invalid proficiency levels (must be 1-10)
- Duplicate skill names
- Category validation
- Database insertion failures

**Experience Errors:**
- Date range validation (end date after start date)
- Missing company or designation
- Text field length limits
- Database foreign key violations

**Education Errors:**
- Invalid CGPA values
- Missing degree or university
- Date validation
- Database constraint errors

**Training/Certification Errors:**
- Invalid certificate URLs
- Missing completion dates
- Provider validation
- File storage errors

**Achievement Errors:**
- Missing title or description
- Date validation
- Category restrictions
- Database insertion failures

**Project Errors:**
- Missing project name
- Technology validation
- Date range validation
- Description length limits

### RPC Function Errors
When server-side RPC functions fail:

**What Happens:**
1. Entire import process stops
2. Database transaction is rolled back
3. Detailed error is returned to client
4. User receives specific failure reason

**Common RPC Errors:**
- Database connection failures
- Transaction timeout
- Memory limits exceeded
- Foreign key constraint violations
- Concurrent modification conflicts

**Error Response Structure:**
```javascript
{
  success: false,
  error: "Database connection timeout",
  details: {
    section: "experiences",
    recordIndex: 3,
    sqlError: "Connection timeout after 30 seconds"
  }
}
```

### System-Level Errors
When infrastructure failures occur:

**What Happens:**
- Complete import failure
- All changes are rolled back
- System error is logged
- User receives generic error message with support guidance

**Common System Errors:**
- Supabase RPC service unavailable
- Edge function timeout
- Memory allocation failures
- Network connectivity issues

## Data Migration & Backward Compatibility

### Automatic Migration
The system handles legacy data formats:

```javascript
// Legacy format migration
if (data.personalInfo && !data.generalInfo) {
  data.generalInfo = ProfileJSONService.migratePersonalInfoToGeneralInfo(data);
  // User is notified about format update
}
```

### Data Cleaning
Before processing, data is cleaned:
- Empty strings converted to null
- Invalid dates normalized
- URL formats validated
- Text fields trimmed and sanitized

## Performance Considerations

### Memory Management
- Large JSON files are processed in chunks
- Efficient data structures minimize memory usage
- Garbage collection between sections

### Database Optimization
- Batch insertions where possible
- Transaction management for data integrity
- Index usage for foreign key lookups

### Progress Tracking
Detailed progress information includes:
- Total sections to process
- Current section being processed
- Records processed per section
- Success/failure counts per section

## Best Practices

### Data Preparation
1. **Validate JSON**: Use online JSON validators before upload
2. **Check Required Fields**: Ensure all mandatory fields are present
3. **Date Formats**: Use ISO date format (YYYY-MM-DD)
4. **File Size**: Keep files under 10MB for optimal performance

### Error Prevention
1. **Use Export as Template**: Export existing profiles as reference
2. **Test with Minimal Data**: Start with basic profile data
3. **Incremental Import**: Import sections gradually
4. **Backup Existing Data**: Export current data before import

### Troubleshooting
1. **Review Error Messages**: Check specific section failures
2. **Validate Data Types**: Ensure numbers are numbers, dates are dates
3. **Check Relationships**: Verify foreign key references exist
4. **Monitor Performance**: Watch for timeout issues with large files

## Security Considerations

### Input Validation
- JSON schema validation prevents malicious data
- SQL injection prevention through parameterized queries
- File size limits prevent DoS attacks

### Data Integrity
- Database transactions ensure all-or-nothing imports
- Foreign key constraints maintain referential integrity
- Business rule validation ensures data quality

### Access Control
- Only authorized users can import profile data
- All import operations are logged for audit
- Sensitive data is handled according to privacy policies
