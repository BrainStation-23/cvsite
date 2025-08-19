
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileSize = file.size;
    const maxSize = 20 * 1024 * 1024; // 20MB limit for Gemini

    if (fileSize > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 20MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileType = file.type;
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!supportedTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please use PDF, DOCX, or TXT files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Uploading file to Gemini:', file.name, 'Size:', fileSize, 'Type:', fileType);

    // Step 1: Start resumable upload
    const uploadResponse = await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files', {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': fileSize.toString(),
        'X-Goog-Upload-Header-Content-Type': fileType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: {
          display_name: file.name
        }
      })
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Failed to start upload:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to start file upload to Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uploadUrl = uploadResponse.headers.get('x-goog-upload-url');
    if (!uploadUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to get upload URL from Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Upload the actual file bytes
    const fileBuffer = await file.arrayBuffer();
    const uploadFileResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': fileSize.toString(),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      body: fileBuffer
    });

    if (!uploadFileResponse.ok) {
      const errorText = await uploadFileResponse.text();
      console.error('Failed to upload file:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileInfo = await uploadFileResponse.json();
    const fileUri = fileInfo.file?.uri;

    if (!fileUri) {
      console.error('No file URI in response:', fileInfo);
      return new Response(
        JSON.stringify({ error: 'Failed to get file URI from Gemini' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File uploaded successfully, URI:', fileUri);

    // Step 3: Generate content using the uploaded file
    const generateResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'Extract all text content from this document. Return only the raw text content without any formatting, analysis, or additional commentary.'
            },
            {
              file_data: {
                mime_type: fileType,
                file_uri: fileUri
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Gemini generation error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to extract text from document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generateData = await generateResponse.json();
    const extractedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!extractedText || extractedText.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Could not extract meaningful text from the file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Text extraction successful, length:', extractedText.length);

    return new Response(
      JSON.stringify({ 
        extractedText,
        fileName: file.name,
        fileSize,
        fileType,
        fileUri // Include for potential cleanup later
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-cv-parser:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to parse file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
