
# Employee Data Bulk Import Documentation

## Overview

The Employee Data section provides comprehensive bulk import functionality that allows administrators to import employee profile data, images, and perform bulk user operations efficiently.

## Available Bulk Import Features

### 1. Bulk User Creation/Update
**Location**: Main Employee Data page
**Component**: `BulkUploadDialog` (triggered by "Bulk Upload" button)

#### How it works:
- Uses CSV file format for user data
- Supports both creating new users and updating existing ones
- Processes users in chunks (250 users per chunk) to prevent system overload
- Provides real-time progress tracking
- Handles foreign key relationships (SBU, expertise, resource types, managers)

#### Supported Fields:
- `email` (required)
- `firstName` (required) 
- `lastName` (required)
- `role` (defaults to 'employee')
- `password` (auto-generated if not provided)
- `employeeId`
- `managerEmail`
- `sbuName`
- `expertiseName`
- `resourceTypeName`
- `dateOfJoining`
- `careerStartDate`

#### Process Flow:
1. Upload CSV file
2. File is parsed and validated
3. Users are processed in batches of 250
4. Foreign key lookups are performed (SBU by name, manager by email, etc.)
5. Auth users are created/updated via Supabase Edge Function
6. Profile information is updated
7. Progress and results are displayed

### 2. Bulk Profile Data Import
**Location**: Individual employee profile pages
**Component**: `BulkImportModal`

#### How it works:
- Accepts JSON files named with employee IDs (e.g., `EMP001.json`)
- Maps employee IDs to profile IDs automatically
- Processes multiple JSON files simultaneously (5 files at a time)
- Uses `import_profile_json` RPC function for server-side processing

#### Supported Data Structure:
```json
{
  "generalInfo": {
    "firstName": "string",
    "lastName": "string",
    "biography": "string",
    "current_designation": "string"
  },
  "technicalSkills": [
    {
      "name": "string",
      "proficiency": number
    }
  ],
  "specializedSkills": [...],
  "experiences": [...],
  "education": [...],
  "trainings": [...],
  "achievements": [...],
  "projects": [...]
}
```

#### Process Flow:
1. Drop/select JSON files
2. Parse file contents and extract employee IDs from filenames
3. Find matching profile IDs in database
4. Process files in batches of 5
5. Call server-side import function for each profile
6. Display import results and status

### 3. Bulk Image Import
**Location**: Employee profile management
**Component**: `BulkImageImportModal`

#### How it works:
- Accepts image files named with employee IDs (e.g., `EMP001.jpg`)
- Supports multiple image formats (PNG, JPG, JPEG, GIF, WebP)
- Maximum file size: 5MB per image
- Automatically maps employee IDs to profiles
- Uploads to Supabase Storage and updates profile records

#### Process Flow:
1. Drop/select image files
2. Extract employee IDs from filenames
3. Find matching profiles
4. Upload images to Supabase Storage bucket `profile-images`
5. Update profile records with image URLs
6. Handle existing image cleanup

## Technical Implementation

### Edge Functions Used:
- `bulk-create-users`: Handles user creation in batches
- `bulk-update-users`: Handles user updates in chunks
- `import_profile_json`: Server-side profile data import

### Key Hooks:
- `useChunkedBulkUpdate`: Manages chunked processing for large datasets
- `useBulkResourcePlanningImport`: Handles resource planning imports
- `useImageUpload`: Manages image upload operations
- `useProfileImport`: Handles profile data imports

### CSV Parsing:
- Uses `papaparse` library for CSV parsing
- Flexible header mapping (handles variations in column names)
- Data validation and cleaning
- Error reporting for invalid data

### Error Handling:
- Comprehensive error tracking per item
- Failed operations are collected and can be downloaded as CSV
- Real-time error display during processing
- Graceful handling of network issues and timeouts

## Data Validation

### User Data Validation:
- Email format validation
- Required field checking
- Role validation (admin, manager, employee)
- Foreign key validation (SBU, expertise, resource type existence)
- Manager email validation

### Profile Data Validation:
- JSON structure validation
- Data type checking
- Date format parsing (flexible formats supported)
- Skill proficiency range validation (1-10)

### Image Validation:
- File type validation
- File size limits (5MB)
- Employee ID extraction from filename
- Profile existence verification

## Performance Optimization

### Chunked Processing:
- Large datasets are processed in manageable chunks
- Prevents timeout issues
- Allows for progress tracking
- Enables partial success scenarios

### Batch Operations:
- Database operations are batched where possible
- Reduces individual API calls
- Improves overall performance

### Error Recovery:
- Failed items don't block entire import
- Partial success is supported
- Detailed error reporting for troubleshooting

## Best Practices

### CSV File Preparation:
1. Use UTF-8 encoding
2. Include all required fields (email, firstName, lastName)
3. Use consistent date formats (YYYY-MM-DD preferred)
4. Validate email addresses before upload
5. Ensure manager emails exist in system

### JSON File Preparation:
1. Name files with correct employee IDs
2. Follow the documented JSON structure
3. Use flexible date formats (system will parse automatically)
4. Validate JSON syntax before upload

### Image File Preparation:
1. Use clear, professional images
2. Keep file sizes under 5MB
3. Name files with employee IDs
4. Use supported formats (PNG, JPG, JPEG, GIF, WebP)

## Troubleshooting

### Common Issues:
1. **CSV parsing errors**: Check file encoding and format
2. **Profile not found**: Verify employee IDs exist in system
3. **Foreign key errors**: Ensure referenced entities (SBU, managers) exist
4. **Image upload failures**: Check file size and format
5. **Timeout issues**: Process smaller batches

### Error Recovery:
- Download error reports for failed items
- Fix issues and re-import failed items
- Use partial import results when some items succeed

## Security Considerations

- All operations require admin or manager roles
- File uploads are validated and sanitized
- Profile data is validated before insertion
- RPC functions have security definer access
- Row Level Security (RLS) policies are enforced

## Future Enhancements

- Support for additional file formats
- Real-time progress WebSocket updates
- Advanced data transformation options
- Bulk export functionality
- Template generation for CSV files
