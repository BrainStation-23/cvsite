
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log('Processing CV file:', file.name, 'Size:', fileSize, 'Type:', fileType);

    // Fetch database context for better AI prompts
    const [universitiesRes, degreesRes, departmentsRes, designationsRes] = await Promise.all([
      supabase.from('universities').select('name').limit(100),
      supabase.from('degrees').select('name, full_form').limit(50),
      supabase.from('departments').select('name, full_form').limit(50),
      supabase.from('designations').select('name').limit(100)
    ]);

    const universities = universitiesRes.data?.map(u => u.name) || [];
    const degrees = degreesRes.data?.map(d => d.name + (d.full_form ? ` (${d.full_form})` : '')) || [];
    const departments = departmentsRes.data?.map(d => d.name + (d.full_form ? ` (${d.full_form})` : '')) || [];
    const designations = designationsRes.data?.map(d => d.name) || [];

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

    // Create JSON Schema for structured output
    const profileSchema = {
      type: "OBJECT",
      properties: {
        generalInfo: {
          type: "OBJECT",
          required: ["firstName", "lastName"],
          properties: {
            firstName: { type: "STRING" },
            lastName: { type: "STRING" },
            biography: { type: "STRING", nullable: true },
            profileImage: { type: "STRING", nullable: true },
            current_designation: { 
              type: "STRING", 
              nullable: true,
              ...(designations.length > 0 && { enum: designations.slice(0, 20) })
            }
          }
        },
        technicalSkills: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["name", "proficiency"],
            properties: {
              name: { type: "STRING" },
              proficiency: { type: "NUMBER" }
            }
          }
        },
        specializedSkills: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["name", "proficiency"],
            properties: {
              name: { type: "STRING" },
              proficiency: { type: "NUMBER" }
            }
          }
        },
        experiences: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["companyName", "designation"],
            properties: {
              companyName: { type: "STRING" },
              designation: { 
                type: "STRING",
                ...(designations.length > 0 && { enum: designations.slice(0, 20) })
              },
              description: { type: "STRING", nullable: true },
              startDate: { type: "STRING", nullable: true },
              endDate: { type: "STRING", nullable: true },
              isCurrent: { type: "BOOLEAN", nullable: true }
            }
          }
        },
        education: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["university"],
            properties: {
              university: { 
                type: "STRING",
                ...(universities.length > 0 && { enum: universities.slice(0, 20) })
              },
              degree: { 
                type: "STRING", 
                nullable: true,
                ...(degrees.length > 0 && { enum: degrees.slice(0, 15) })
              },
              department: { 
                type: "STRING", 
                nullable: true,
                ...(departments.length > 0 && { enum: departments.slice(0, 15) })
              },
              gpa: { type: "STRING", nullable: true },
              startDate: { type: "STRING", nullable: true },
              endDate: { type: "STRING", nullable: true },
              isCurrent: { type: "BOOLEAN", nullable: true }
            }
          }
        },
        trainings: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["title"],
            properties: {
              title: { type: "STRING" },
              provider: { type: "STRING", nullable: true },
              description: { type: "STRING", nullable: true },
              date: { type: "STRING", nullable: true },
              certificateUrl: { type: "STRING", nullable: true }
            }
          }
        },
        achievements: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["title"],
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING", nullable: true },
              date: { type: "STRING", nullable: true }
            }
          }
        },
        projects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["name"],
            properties: {
              name: { type: "STRING" },
              role: { type: "STRING", nullable: true },
              description: { type: "STRING", nullable: true },
              responsibility: { type: "STRING", nullable: true },
              startDate: { type: "STRING", nullable: true },
              endDate: { type: "STRING", nullable: true },
              isCurrent: { type: "BOOLEAN", nullable: true },
              technologiesUsed: { 
                type: "ARRAY", 
                nullable: true,
                items: { type: "STRING" }
              },
              url: { type: "STRING", nullable: true }
            }
          }
        },
        confidence: {
          type: "OBJECT",
          properties: {
            overall: { type: "STRING", enum: ["high", "medium", "low"] },
            sections: {
              type: "OBJECT",
              properties: {
                generalInfo: { type: "STRING", enum: ["high", "medium", "low"] },
                technicalSkills: { type: "STRING", enum: ["high", "medium", "low"] },
                specializedSkills: { type: "STRING", enum: ["high", "medium", "low"] },
                experiences: { type: "STRING", enum: ["high", "medium", "low"] },
                education: { type: "STRING", enum: ["high", "medium", "low"] },
                trainings: { type: "STRING", enum: ["high", "medium", "low"] },
                achievements: { type: "STRING", enum: ["high", "medium", "low"] },
                projects: { type: "STRING", enum: ["high", "medium", "low"] }
              }
            }
          }
        }
      },
      required: ["generalInfo", "technicalSkills", "specializedSkills", "experiences", "education", "trainings", "achievements", "projects", "confidence"]
    };

    // Step 3: Generate content and analyze CV with structured output
    const prompt = `
Extract comprehensive CV/Resume information from the uploaded document. Follow these extraction guidelines:

EXTRACTION RULES:
1. Extract all personal information, skills, experience, education, training, achievements, and projects
2. For skill proficiency: use 1-5 scale (1=beginner, 5=expert), default to 1 if not specified
3. Use YYYY-MM-DD format for all dates
4. Set isCurrent to true for ongoing positions/education/projects
5. Extract technical skills (programming languages, frameworks, tools, software)
6. Extract specialized skills (domain expertise, certifications, methodologies)
7. Only include education entries for recognized universities from the provided list
8. Only use valid designations from the provided list for experience roles
9. Provide confidence scoring for each section based on clarity and completeness of extracted data

CONFIDENCE SCORING:
- "high": Clear, complete information with specific details
- "medium": Partial information with some details missing
- "low": Minimal or unclear information

DATA CONSTRAINTS:
- Universities must match: ${universities.slice(0, 20).join(', ')}
- Degrees should match: ${degrees.slice(0, 15).join(', ')}
- Departments should match: ${departments.slice(0, 15).join(', ')}
- Designations should match: ${designations.slice(0, 20).join(', ')}`;

    const generateResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
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
          responseMimeType: "application/json",
          responseSchema: profileSchema
        }
      })
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Gemini generation error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze CV with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generateData = await generateResponse.json();
    const structuredResult = generateData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!structuredResult) {
      console.error('No structured result received from Gemini');
      return new Response(
        JSON.stringify({ error: 'No analysis result received from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedResult;
    try {
      // Since we're using structured output, the response should already be valid JSON
      parsedResult = JSON.parse(structuredResult);
      console.log('CV processing successful with structured output');
      
      // Extract confidence data
      const confidence = parsedResult.confidence || { overall: 'medium' };
      
      // Remove confidence from profile data before returning
      const { confidence: _, ...profileData } = parsedResult;

      return new Response(
        JSON.stringify({ 
          profileData,
          confidence: confidence.overall || 'medium',
          confidenceBreakdown: confidence.sections || {},
          fileName: file.name,
          fileSize,
          fileType,
          fileUri // Include for potential cleanup later
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      console.error('Failed to parse structured response:', parseError);
      console.log('Raw structured response:', structuredResult);
      
      // Fallback: return a basic error structure
      return new Response(
        JSON.stringify({ error: 'AI returned malformed structured output' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in ai-cv-processor:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process CV' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
