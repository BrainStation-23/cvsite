
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
  search_query?: string;
  skill_filter?: string;
  experience_filter?: string;
  education_filter?: string;
  training_filter?: string;
  achievement_filter?: string;
  project_filter?: string;
  min_experience_years?: number;
  max_experience_years?: number;
  min_graduation_year?: number;
  max_graduation_year?: number;
  completion_status?: string;
}

interface AISearchResponse {
  filters: SearchFilters;
  confidence: number;
  explanation: string;
  originalQuery: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log(`Processing AI search query: "${query}"`);

    const prompt = `
You are an expert at parsing employee search queries and converting them into structured database filters.

Given this natural language query: "${query}"

Extract relevant search parameters and map them to these available filters:

- search_query: general text search across names, IDs, biography
- skill_filter: technical/specialized skills (programming languages, frameworks, tools)
- experience_filter: company names, job titles, role descriptions
- education_filter: university names, degrees, departments
- training_filter: certifications, courses, training programs
- achievement_filter: awards, recognition, accomplishments
- project_filter: project names, descriptions, technologies used
- min_experience_years: minimum years of experience (numeric)
- max_experience_years: maximum years of experience (numeric)
- min_graduation_year: earliest graduation year (4-digit year)
- max_graduation_year: latest graduation year (4-digit year)
- completion_status: "complete", "incomplete", "no-skills", "no-experience", "no-education", or null

Return a JSON response with this exact structure:
{
  "filters": {
    // Only include filters that are relevant to the query
  },
  "confidence": 0.95, // 0-1 confidence score
  "explanation": "Brief explanation of how the query was interpreted"
}

Rules:
- Only include filters that are clearly indicated by the query
- Use skill_filter for specific technologies, programming languages, frameworks
- Use experience_filter for company names, job titles, seniority levels
- Use education_filter for universities, degrees, academic departments
- Extract numeric ranges carefully for experience and graduation years
- If query mentions "senior" or similar, include it in experience_filter rather than as separate terms
- Be conservative - better to miss a filter than to include incorrect ones
- Confidence should reflect how certain you are about the interpretation

Examples:
"React developers from Google" → skill_filter: "React", experience_filter: "Google"
"MIT computer science graduates" → education_filter: "MIT computer science"
"Senior engineers with 5+ years experience" → experience_filter: "senior engineer", min_experience_years: 5
"AWS certified developers" → skill_filter: "AWS", training_filter: "AWS"
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('AI response text:', aiResponse);

    // Parse the JSON response from Gemini
    let parsedResponse: { filters: SearchFilters; confidence: number; explanation: string };
    try {
      // Clean the response - remove any markdown formatting
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Response:', aiResponse);
      // Fallback: treat the query as a general search
      parsedResponse = {
        filters: { search_query: query },
        confidence: 0.5,
        explanation: "Could not parse query with AI, using general search"
      };
    }

    // Validate and sanitize the filters
    const validatedFilters: SearchFilters = {};
    
    if (parsedResponse.filters.search_query) {
      validatedFilters.search_query = String(parsedResponse.filters.search_query).trim();
    }
    if (parsedResponse.filters.skill_filter) {
      validatedFilters.skill_filter = String(parsedResponse.filters.skill_filter).trim();
    }
    if (parsedResponse.filters.experience_filter) {
      validatedFilters.experience_filter = String(parsedResponse.filters.experience_filter).trim();
    }
    if (parsedResponse.filters.education_filter) {
      validatedFilters.education_filter = String(parsedResponse.filters.education_filter).trim();
    }
    if (parsedResponse.filters.training_filter) {
      validatedFilters.training_filter = String(parsedResponse.filters.training_filter).trim();
    }
    if (parsedResponse.filters.achievement_filter) {
      validatedFilters.achievement_filter = String(parsedResponse.filters.achievement_filter).trim();
    }
    if (parsedResponse.filters.project_filter) {
      validatedFilters.project_filter = String(parsedResponse.filters.project_filter).trim();
    }
    
    // Handle numeric filters
    if (parsedResponse.filters.min_experience_years && !isNaN(Number(parsedResponse.filters.min_experience_years))) {
      validatedFilters.min_experience_years = Number(parsedResponse.filters.min_experience_years);
    }
    if (parsedResponse.filters.max_experience_years && !isNaN(Number(parsedResponse.filters.max_experience_years))) {
      validatedFilters.max_experience_years = Number(parsedResponse.filters.max_experience_years);
    }
    if (parsedResponse.filters.min_graduation_year && !isNaN(Number(parsedResponse.filters.min_graduation_year))) {
      validatedFilters.min_graduation_year = Number(parsedResponse.filters.min_graduation_year);
    }
    if (parsedResponse.filters.max_graduation_year && !isNaN(Number(parsedResponse.filters.max_graduation_year))) {
      validatedFilters.max_graduation_year = Number(parsedResponse.filters.max_graduation_year);
    }
    
    // Handle completion status
    const validStatuses = ['complete', 'incomplete', 'no-skills', 'no-experience', 'no-education'];
    if (parsedResponse.filters.completion_status && validStatuses.includes(parsedResponse.filters.completion_status)) {
      validatedFilters.completion_status = parsedResponse.filters.completion_status;
    }

    const result: AISearchResponse = {
      filters: validatedFilters,
      confidence: Math.max(0, Math.min(1, Number(parsedResponse.confidence) || 0.5)),
      explanation: String(parsedResponse.explanation || 'AI interpreted your search query'),
      originalQuery: query
    };

    console.log('Final AI search result:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search-query function:', error);
    
    // Return a fallback response
    const fallbackResponse: AISearchResponse = {
      filters: { search_query: (await req.json()).query || '' },
      confidence: 0.3,
      explanation: `Error processing AI query: ${error.message}. Using fallback search.`,
      originalQuery: (await req.json()).query || ''
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200, // Return 200 to allow graceful degradation
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
