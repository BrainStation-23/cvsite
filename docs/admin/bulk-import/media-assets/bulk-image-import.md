
# Bulk Image Import

## Overview
The bulk image import feature allows administrators to upload multiple profile images simultaneously. Images are automatically matched to employee profiles based on filename patterns and uploaded to Supabase Storage.

## How It Works

### Process Flow
1. **File Selection**: Multiple image files are selected via drag-and-drop
2. **File Validation**: Each image is validated for type, size, and naming
3. **Employee ID Extraction**: Employee IDs are extracted from filenames
4. **Profile Matching**: Employee IDs are matched against existing profiles
5. **Batch Processing**: Images are processed in batches of 3 to prevent overload
6. **Storage Upload**: Images are uploaded to Supabase Storage
7. **Database Update**: Profile records are updated with new image URLs

### Technical Implementation
- **Frontend Component**: `src/components/employee/BulkImageImportModal.tsx`
- **Upload Hook**: `src/components/employee/bulk-image-import/useImageUpload.ts`
- **Storage Service**: Supabase Storage with automatic URL generation
- **Database Integration**: Direct profile table updates

## Supported File Formats

### Image Types
- **JPEG/JPG**: Standard photo format
- **PNG**: Supports transparency
- **WebP**: Modern compressed format
- **GIF**: Animated images (converted to static)

### File Requirements
- **Maximum Size**: 5MB per image
- **Naming Convention**: `{employeeId}.{extension}` (e.g., `EMP001.jpg`)
- **Resolution**: No specific limits, but recommended 500x500px minimum

## Exception Handling

### File Validation Errors (Pre-Processing)
When files fail validation before processing:

**What Happens:**
- Invalid files are rejected immediately
- User receives specific error for each file
- Valid files continue to processing queue
- No storage space is consumed

**Common Validation Errors:**
1. **Invalid File Type**
   - Error: "File filename.txt is not an image file"
   - Action: File is rejected, user must provide image files only

2. **File Size Exceeded**
   - Error: "Image filename.jpg must be less than 5MB"
   - Action: File is rejected, user must compress or resize image

3. **Invalid Filename Format**
   - Error: "Cannot extract employee ID from filename"
   - Action: File is marked for manual review

### Profile Matching Errors
When employee profiles cannot be found:

**What Happens:**
1. File status is set to 'skipped'
2. No processing occurs for that file
3. File remains in the interface for user review
4. Summary includes count of skipped files

**Common Matching Errors:**
- Employee ID not found in database
- Inactive employee profiles
- Duplicate employee IDs in different files

**Error Handling Process:**
```javascript
const profileMap = new Map(profiles?.map(p => [p.employee_id, p.id]) || []);

const updatedFiles = files.map(file => ({
  ...file,
  profileId: profileMap.get(file.employeeId),
  status: profileMap.has(file.employeeId) ? 'pending' : 'skipped'
}));
```

### Upload Processing Errors
When individual image uploads fail:

**What Happens:**
1. File status changes to 'error'
2. Specific error message is captured
3. Processing continues with remaining files
4. Failed uploads can be retried individually

**Common Upload Errors:**

**Storage Upload Failures:**
- Network connectivity issues
- Supabase Storage service errors
- File corruption during upload
- Storage quota exceeded

**Database Update Failures:**
- Profile record not found
- Database connection timeout
- Constraint violations
- Permission errors

**Error Handling Implementation:**
```javascript
try {
  // Delete existing image first
  await deleteExistingImage(file.profileId!);
  
  // Upload new image
  const imageUrl = await uploadImageToSupabase(file.file, file.profileId!);
  
  // Update database
  await updateProfileImage(file.profileId!, imageUrl);
  
  setFiles(prev => prev.map(f => 
    f.file.name === file.file.name 
      ? { ...f, status: 'success', imageUrl }
      : f
  ));
} catch (error) {
  setFiles(prev => prev.map(f => 
    f.file.name === file.file.name 
      ? { ...f, status: 'error', error: error.message }
      : f
  ));
}
```

### Batch Processing Errors
When entire batches fail:

**What Happens:**
1. Batch processing stops for that batch
2. Individual files in batch are marked as failed
3. Processing continues with next batch
4. System attempts to recover gracefully

**Common Batch Errors:**
- Memory exhaustion
- Concurrent upload limits exceeded
- Supabase service rate limiting
- Network timeout for entire batch

### System-Level Errors
When infrastructure failures occur:

**What Happens:**
- All processing stops immediately
- Current upload progress is preserved
- User receives system error notification
- Partial results are maintained for retry

**Common System Errors:**
- Supabase Storage unavailable
- Database connection failures
- Browser memory limits exceeded
- Network connectivity lost

## Storage Management

### File Organization
Images are stored with organized paths:
```
profile-images/
├── {profileId}/
│   └── profile-{timestamp}.{extension}
```

### Existing Image Handling
When uploading new images:
1. **Detection**: Check for existing profile images
2. **Cleanup**: Delete old images from storage
3. **Upload**: Upload new image with timestamp
4. **Update**: Update database with new URL

### Error Recovery for Storage
- Automatic cleanup of failed uploads
- Orphaned file detection and removal
- Storage quota monitoring
- Fallback URL generation

## Performance Optimization

### Batch Processing Strategy
- **Batch Size**: 3 images processed simultaneously
- **Sequential Batches**: Prevents system overload
- **Progress Tracking**: Real-time progress updates
- **Memory Management**: Efficient file handling

### Image Optimization
- **Compression**: Automatic compression for large images
- **Format Conversion**: WebP conversion for better compression
- **Thumbnail Generation**: Automatic thumbnail creation
- **Progressive Upload**: Chunked upload for large files

### Network Optimization
- **Retry Logic**: Automatic retry for failed uploads
- **Connection Pooling**: Efficient network resource usage
- **Bandwidth Management**: Throttling for large batches
- **CDN Integration**: Fast global image delivery

## Monitoring & Analytics

### Upload Statistics
- Total files processed
- Success/failure rates
- Average upload time per file
- Storage space utilized
- Network bandwidth consumed

### Error Analytics
- Most common error types
- Failure patterns by file size/type
- Peak usage time analysis
- User behavior patterns

## Best Practices

### File Preparation
1. **Naming Convention**: Use clear, consistent employee ID patterns
2. **Image Quality**: Optimize images for web (balance quality/size)
3. **Batch Size**: Upload 50-100 images at a time for optimal performance
4. **File Organization**: Organize files by department or batch

### Error Prevention
1. **Validate Employee IDs**: Verify all employee IDs exist before upload
2. **Image Preprocessing**: Resize and compress images beforehand
3. **Network Stability**: Ensure stable internet connection
4. **Browser Resources**: Close unnecessary browser tabs during upload

### Troubleshooting
1. **Check File Names**: Ensure filenames match employee ID format
2. **Verify File Types**: Use supported image formats only
3. **Monitor Progress**: Watch real-time upload progress
4. **Review Error Messages**: Address specific error causes
5. **Retry Failed Uploads**: Use selective retry for failed images

## Security Considerations

### File Validation
- MIME type verification prevents malicious files
- File size limits prevent DoS attacks
- Image format validation ensures safe processing
- Virus scanning for uploaded content

### Access Control
- Only authorized administrators can perform bulk uploads
- Upload activity is logged for audit purposes
- Storage permissions are properly configured
- Rate limiting prevents abuse

### Data Privacy
- Images are stored securely in Supabase Storage
- Access URLs are properly secured
- Personal data handling complies with privacy policies
- Image deletion is thorough and complete
