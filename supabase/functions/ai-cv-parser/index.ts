
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

    const fileType = file.type;
    const fileSize = file.size;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (fileSize > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedText = '';

    if (fileType === 'text/plain') {
      extractedText = await file.text();
    } else if (fileType === 'application/pdf') {
      // For PDF parsing, we'll use a simple text extraction approach
      // In production, you might want to use a more robust PDF parser
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder();
      extractedText = decoder.decode(arrayBuffer);
      
      // Basic PDF text extraction (this is simplified)
      const pdfMatch = extractedText.match(/stream\s*(.*?)\s*endstream/gs);
      if (pdfMatch) {
        extractedText = pdfMatch.join(' ').replace(/stream|endstream/g, '');
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX, we'll extract text content (simplified approach)
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder();
      const docxContent = decoder.decode(arrayBuffer);
      
      // Extract text between document tags (simplified)
      const textMatch = docxContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatch) {
        extractedText = textMatch.map(match => 
          match.replace(/<w:t[^>]*>|<\/w:t>/g, '')
        ).join(' ');
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please use PDF, DOCX, or TXT files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean and normalize the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim();

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
        fileType
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
