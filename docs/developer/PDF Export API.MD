Here’s a polished **Markdown documentation** version of your testing guide:

---

# CV PDF Export Edge Function – Testing Guide

## 📖 Overview

This Edge Function generates **PDF CVs** by taking a `profile_id` and `template_id`, fetching employee data, processing it through a template, and returning a **base64-encoded PDF**.

---

## 🔗 API Endpoint

```
POST https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

---

## 🔐 Authentication

* The function uses **service role authentication internally**.
* **No authentication headers** are required from external callers.

---

## 📤 Request Format

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

---

## 🧪 Sample Testing Examples

### 1. Using cURL

```bash
# Basic test with sample data
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "09582f2b-756f-437c-bce1-a90b934368ca",
    "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"
  }' \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf
```

---

### 2. Using JavaScript (Fetch)

```javascript
const exportCV = async (profileId, templateId) => {
  try {
    const response = await fetch(
      'https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, template_id: templateId })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.error}`);
    }

    const result = await response.json();
    if (result.success) {
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))],
        { type: 'application/pdf' }
      );

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || 'cv.pdf';
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('CV export failed:', error);
  }
};

// Usage
exportCV(
  '09582f2b-756f-437c-bce1-a90b934368ca',
  '6c021e9f-0e37-487a-be10-fabb4b767872'
);
```

---

### 3. Using Python

```python
import requests
import base64

def export_cv_pdf(profile_id, template_id, output_filename=None):
    url = 'https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf'
    payload = {'profile_id': profile_id, 'template_id': template_id}
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()

        if result.get('success'):
            pdf_data = base64.b64decode(result['pdf'])
            filename = output_filename or result.get('filename', 'cv.pdf')
            with open(filename, 'wb') as f:
                f.write(pdf_data)
            print(f"CV PDF saved as: {filename}")
            return filename
        else:
            print(f"Export failed: {result.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"Error: {e}")

# Usage
export_cv_pdf(
    '09582f2b-756f-437c-bce1-a90b934368ca',
    '6c021e9f-0e37-487a-be10-fabb4b767872',
    'employee_cv.pdf'
)
```

---

### 4. Using Node.js

```javascript
const fs = require('fs');

async function exportCVPDF(profileId, templateId, outputPath = 'cv.pdf') {
  try {
    const response = await fetch(
      'https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, template_id: templateId })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.error}`);
    }

    const result = await response.json();
    if (result.success) {
      const pdfBuffer = Buffer.from(result.pdf, 'base64');
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log(`CV PDF saved as: ${outputPath}`);
      console.log(`Original filename: ${result.filename}`);
      return outputPath;
    } else {
      throw new Error(`Export failed: ${result.error}`);
    }
  } catch (error) {
    console.error('CV export failed:', error);
    throw error;
  }
}

// Usage
exportCVPDF(
  '09582f2b-756f-437c-bce1-a90b934368ca',
  '6c021e9f-0e37-487a-be10-fabb4b767872',
  './exported_cv.pdf'
);
```

---

## 📊 Test Data

### Sample Profile IDs

* `09582f2b-756f-437c-bce1-a90b934368ca` → Abdullah Al Ashik (BS1664)
* `b9206c65-f4e0-4b9d-95e9-40989eb3485d` → Abdullah Al Faisal (BS1964)
* `0ad23d28-4e38-4956-9746-3bbe5ebee792` → Awsaf (BS1690)

### Sample Template IDs

* `6c021e9f-0e37-487a-be10-fabb4b767872` → Sidebar – Full, Portrait, Default
* `615f5fce-34a3-4f48-8170-4ca7ca2882d0` → Unipet Template S, Landscape
* `decaa7e2-287c-415d-ac41-69890136611c` → Sidebar (5:5)\[M], Portrait

---

## 📥 Response Format

### ✅ Success (200)

```json
{
  "success": true,
  "pdf": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...",
  "filename": "CV-Abdullah-Al-Ashik-Sidebar-Full.pdf"
}
```

### ❌ Error Cases

* **Missing Parameters (400)**

```json
{ "error": "profile_id and template_id are required" }
```

* **Profile Not Found (500)**

```json
{ "error": "Employee data not found", "code": "EXPORT_FAILED" }
```

* **Template Not Found (500)**

```json
{ "error": "CV template not found", "code": "EXPORT_FAILED" }
```

* **Service Down (503)**

```json
{ "error": "PDF generation service is currently unavailable. Please try again later.", "code": "SERVICE_UNAVAILABLE" }
```

* **Method Not Allowed (405)**

```json
{ "error": "Method not allowed" }
```

---

## ⚠️ Error Handling Best Practices

* Always check **HTTP status codes** before processing responses.
* Gracefully handle **503 errors** (service may be temporarily unavailable).
* Implement **retry logic** for transient failures (503, network timeouts).
* Validate **UUIDs** before sending requests.
* Be cautious with **large PDF responses** (base64 payload can be large).

---

## 🚀 Performance Considerations

* **Response time**: 3–10 seconds (depending on CV complexity).
* **Timeout**: 30 seconds for PDF generation.
* **File size**: Typically 200KB–2MB.
* **Base64 overhead**: \~33% increase in payload size.

---

## 💡 Integration Tips

* **UUID Validation**: Ensure IDs are valid before sending requests.
* **Error UI**: Display user-friendly messages for different error codes.
* **Loading States**: Show progress indicators (since generation takes time).
* **File Handling**: Decode base64 properly in your chosen language.
* **Caching**: Cache frequently requested CVs if applicable.

---

## ⚡ Quick Test Command

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "09582f2b-756f-437c-bce1-a90b934368ca", "template_id": "6c021e9f-0e37-487a-be10-fabb4b767872"}' \
  https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/export-cv-pdf | jq .
```

---

