# CV PDF Export API

## Overview

The CV PDF Export API generates PDF resumes by processing employee data through customizable templates. The API returns the PDF file directly as binary data, ready for download or storage.

## Endpoint

```
POST https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

## Authentication

No authentication headers required - the function uses service role authentication internally.

## Request Format

### Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "profile_id": "uuid-string",
  "template_id": "uuid-string"
}
```

## Usage Examples

### Basic PDF Download
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "09582f2b-756f-437c-bce1-a90b934368ca",
    "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"
  }' \
  -o cv.pdf \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

### Download with Custom Filename
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "09582f2b-756f-437c-bce1-a90b934368ca",
    "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"
  }' \
  -o "employee-cv-$(date +%Y%m%d).pdf" \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

### Check Response Headers
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "09582f2b-756f-437c-bce1-a90b934368ca",
    "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"
  }' \
  -I \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

### Save with Server-Suggested Filename
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "09582f2b-756f-437c-bce1-a90b934368ca",
    "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"
  }' \
  -J -O \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

## Response Format

### Success Response (200)
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="CV-FirstName-LastName-TemplateName.pdf"`
- **Body**: Binary PDF data

### Error Responses

#### Missing Parameters (400)
```json
{ "error": "profile_id and template_id are required" }
```

#### Profile Not Found (404)
```json
{ "error": "Employee data not found", "code": "EXPORT_FAILED" }
```

#### Template Not Found (404)
```json
{ "error": "CV template not found", "code": "EXPORT_FAILED" }
```

#### Service Unavailable (503)
```json
{ "error": "PDF generation service is currently unavailable. Please try again later.", "code": "SERVICE_UNAVAILABLE" }
```

#### Method Not Allowed (405)
```json
{ "error": "Method not allowed" }
```

## Test Data

### Sample Profile IDs
- `09582f2b-756f-437c-bce1-a90b934368ca` → Abdullah Al Ashik (BS1664)
- `b9206c65-f4e0-4b9d-95e9-40989eb3485d` → Abdullah Al Faisal (BS1964)
- `0ad23d28-4e38-4956-9746-3bbe5ebee792` → Awsaf (BS1690)

### Sample Template IDs
- `6c021e9f-0e37-487a-be10-fabb4b767872` → Sidebar – Full, Portrait, Default
- `615f5fce-34a3-4f48-8170-4ca7ca2882d0` → Unipet Template S, Landscape
- `decaa7e2-287c-415d-ac41-69890136611c` → Sidebar (5:5)[M], Portrait

## Quick Test Command

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "09582f2b-756f-437c-bce1-a90b934368ca", "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"}' \
  -o test-cv.pdf \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

## Performance Notes

- **Response time**: 3-10 seconds depending on CV complexity
- **Timeout**: 30 seconds maximum
- **File size**: Typically 200KB-2MB
- **No base64 overhead**: Direct binary transfer for better performance

## Error Handling

- Always check HTTP status codes before processing responses
- Implement retry logic for 503 (service unavailable) errors
- Validate UUIDs before sending requests
- Handle network timeouts gracefully