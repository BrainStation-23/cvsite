
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
    const { extractedText } = await req.json();

    if (!extractedText) {
      return new Response(
        JSON.stringify({ error: 'No extracted text provided' }),
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

    console.log('Analyzing CV with Gemini API...');

    const prompt = `
Extract CV/Resume information from the following text and return ONLY valid JSON in this exact structure:

{
  "generalInfo": {
    "firstName": "string",
    "lastName": "string", 
    "biography": "string or null",
    "profileImage": null,
    "current_designation": "string or null"
  },
  "technicalSkills": [
    {"name": "string", "proficiency": 1}
  ],
  "specializedSkills": [
    {"name": "string", "proficiency": 1}  
  ],
  "experiences": [
    {
      "companyName": "string",
      "designation": "string",
      "description": "string or null",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null", 
      "isCurrent": boolean
    }
  ],
  "education": [
    {
      "university": "string",
      "degree": "string or null",
      "department": "string or null", 
      "gpa": "string or null",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "isCurrent": boolean
    }
  ],
  "trainings": [
    {
      "title": "string",
      "provider": "string or null",
      "description": "string or null",
      "date": "YYYY-MM-DD or null",
      "certificateUrl": null
    }
  ],
  "achievements": [
    {
      "title": "string", 
      "description": "string or null",
      "date": "YYYY-MM-DD or null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "role": "string or null",
      "description": "string", 
      "responsibility": "string or null",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "isCurrent": boolean,
      "technologiesUsed": ["string"],
      "url": "string or null"
    }
  ]
}

IMPORTANT RULES:
1. Set skill proficiency to 1 if not specified
2. Only use universities from this list: ${universities.slice(0, 20).join(', ')}
3. Only use degrees from this list: ${degrees.slice(0, 15).join(', ')}
4. Only use departments from this list: ${departments.slice(0, 15).join(', ')}
5. Only use designations from this list: ${designations.slice(0, 20).join(', ')}
6. Skip education entries if university not in the list
7. Use YYYY-MM-DD format for dates
8. Set isCurrent to true for ongoing positions/education
9. Extract technical skills (programming languages, frameworks, tools) and specialized skills (domain expertise)
10. Return ONLY the JSON object, no additional text or explanation

CV Text:
${extractedText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze CV with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysisResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!analysisResult) {
      return new Response(
        JSON.stringify({ error: 'No analysis result received from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the response to extract JSON
    let cleanedResult = analysisResult.trim();
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', analysisResult);
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('CV analysis successful');

    return new Response(
      JSON.stringify({ 
        profileData: parsedResult,
        confidence: 'medium', // Could be enhanced with confidence scoring
        extractedText: extractedText.substring(0, 500) + '...' // Preview
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-cv-analyzer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during CV analysis' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
