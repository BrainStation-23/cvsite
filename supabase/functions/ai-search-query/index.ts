
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
  search_query?: string | null;
  skill_filter?: string | null;
  experience_filter?: string | null;
  education_filter?: string | null;
  training_filter?: string | null;
  achievement_filter?: string | null;
  project_filter?: string | null;
  project_name_filter?: string | null;
  project_description_filter?: string | null;
  technology_filter?: string[] | null;
  min_experience_years?: number | null;
  max_experience_years?: number | null;
  min_graduation_year?: number | null;
  max_graduation_year?: number | null;
  completion_status?: string | null;
  min_engagement_percentage?: number | null;
  max_engagement_percentage?: number | null;
  min_billing_percentage?: number | null;
  max_billing_percentage?: number | null;
  release_date_from?: string | null;
  release_date_to?: string | null;
  availability_status?: string | null;
  current_project_search?: string | null;
}

interface AISearchResponse {
  filters: SearchFilters;
  confidence: number;
  explanation: string;
  originalQuery: string;
}

serve(async (req) => {
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

    // Define the structured schema for Gemini
    const functionDeclaration = {
      name: "parse_employee_search",
      description: "Parse natural language query into structured employee search parameters",
      parameters: {
        type: "object",
        properties: {
          search_query: {
            type: "string",
            description: "General text search across employee names, IDs, and biography"
          },
          skill_filter: {
            type: "string", 
            description: "Technical or specialized skills (e.g., React, Python, Machine Learning)"
          },
          experience_filter: {
            type: "string",
            description: "Company names, job titles, or work experience descriptions"
          },
          education_filter: {
            type: "string",
            description: "University names, degree names, academic departments"
          },
          training_filter: {
            type: "string",
            description: "Certifications, courses, training programs"
          },
          achievement_filter: {
            type: "string",
            description: "Awards, recognitions, accomplishments"
          },
          project_name_filter: {
            type: "string",
            description: "Specific project names"
          },
          project_description_filter: {
            type: "string", 
            description: "Project details, domains, what the project does"
          },
          technology_filter: {
            type: "array",
            items: { type: "string" },
            description: "Technologies, frameworks, tools used IN PROJECTS"
          },
          min_experience_years: {
            type: "integer",
            minimum: 0,
            maximum: 50,
            description: "Minimum years of work experience"
          },
          max_experience_years: {
            type: "integer", 
            minimum: 0,
            maximum: 50,
            description: "Maximum years of work experience"
          },
          min_graduation_year: {
            type: "integer",
            minimum: 1950,
            maximum: 2030,
            description: "Minimum university graduation year"
          },
          max_graduation_year: {
            type: "integer",
            minimum: 1950, 
            maximum: 2030,
            description: "Maximum university graduation year"
          },
          completion_status: {
            type: "string",
            enum: ["complete", "incomplete", "no-skills", "no-experience", "no-education"],
            description: "Profile completeness status"
          },
          min_engagement_percentage: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Minimum engagement percentage for resource planning"
          },
          max_engagement_percentage: {
            type: "number",
            minimum: 0,
            maximum: 100, 
            description: "Maximum engagement percentage for resource planning"
          },
          min_billing_percentage: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Minimum billing percentage for resource planning"
          },
          max_billing_percentage: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Maximum billing percentage for resource planning"
          },
          release_date_from: {
            type: "string",
            format: "date",
            description: "Start date for availability/release date range (YYYY-MM-DD)"
          },
          release_date_to: {
            type: "string", 
            format: "date",
            description: "End date for availability/release date range (YYYY-MM-DD)"
          },
          availability_status: {
            type: "string",
            enum: ["available", "engaged", "all"],
            description: "Employee availability status"
          },
          current_project_search: {
            type: "string",
            description: "Search within current project names or descriptions"
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence level in the interpretation (0-1)"
          },
          explanation: {
            type: "string",
            description: "Brief explanation of how the query was interpreted"
          }
        },
        required: ["confidence", "explanation"]
      }
    };

    const systemPrompt = `You are an expert at parsing employee search queries for a comprehensive employee profile database.

IMPORTANT DISAMBIGUATION RULES:

1. **Skills vs Project Technologies**:
   - "React developers" → skill_filter: "React" (they have React as a skill)
   - "Projects using React" → technology_filter: ["React"] (React was used in their projects)
   - When unclear, prefer skill_filter

2. **Companies (Experience vs Current Projects)**:
   - "worked at Google" → experience_filter: "Google" (employment history)
   - "Google project" → current_project_search: "Google" (current project client/name)

3. **Experience Years Parsing**:
   - "5 years experience" → min_experience_years: 5
   - "5+ years" → min_experience_years: 5
   - "3-7 years" → min_experience_years: 3, max_experience_years: 7
   - "junior" → max_experience_years: 2
   - "senior" → min_experience_years: 5

4. **Availability & Resource Planning**:
   - "available" → availability_status: "available"
   - "free" → availability_status: "available" 
   - "engaged" → availability_status: "engaged"
   - "80% billable" → min_billing_percentage: 80
   - "less than 50% engaged" → max_engagement_percentage: 50
   - "available next month" → release_date_from: [next month's start date]

5. **Education**:
   - "MIT graduates" → education_filter: "MIT"
   - "Computer Science degree" → education_filter: "Computer Science"
   - "class of 2020" → min_graduation_year: 2020, max_graduation_year: 2020

6. **Profile Completion**:
   - "complete profiles" → completion_status: "complete"
   - "incomplete profiles" → completion_status: "incomplete"
   - "missing skills" → completion_status: "no-skills"

7. **Date Parsing**:
   - Always use YYYY-MM-DD format for dates
   - "next month" = first day of next month
   - "Q1" = January 1st of relevant year
   - "end of year" = December 31st of current year

CONFIDENCE SCORING:
- 0.9+: Very clear queries with specific terms
- 0.7-0.9: Clear intent with minor ambiguity  
- 0.5-0.7: Multiple possible interpretations
- <0.5: Very ambiguous queries

Only include fields that are clearly indicated by the query. Be conservative - better to miss a filter than include an incorrect one.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Parse this employee search query: "${query}"`
          }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        tools: [{
          functionDeclarations: [functionDeclaration]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["parse_employee_search"]
          }
        },
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

    const candidate = data.candidates[0];
    
    // Check if function was called
    if (!candidate.content.parts || !candidate.content.parts[0].functionCall) {
      throw new Error('No function call in Gemini response');
    }

    const functionCall = candidate.content.parts[0].functionCall;
    const parsedArgs = functionCall.args;

    console.log('Parsed function arguments:', JSON.stringify(parsedArgs, null, 2));

    // Build validated filters
    const validatedFilters: SearchFilters = {};
    
    // Text filters
    if (parsedArgs.search_query) validatedFilters.search_query = String(parsedArgs.search_query).trim();
    if (parsedArgs.skill_filter) validatedFilters.skill_filter = String(parsedArgs.skill_filter).trim();
    if (parsedArgs.experience_filter) validatedFilters.experience_filter = String(parsedArgs.experience_filter).trim();
    if (parsedArgs.education_filter) validatedFilters.education_filter = String(parsedArgs.education_filter).trim();
    if (parsedArgs.training_filter) validatedFilters.training_filter = String(parsedArgs.training_filter).trim();
    if (parsedArgs.achievement_filter) validatedFilters.achievement_filter = String(parsedArgs.achievement_filter).trim();
    if (parsedArgs.project_name_filter) validatedFilters.project_name_filter = String(parsedArgs.project_name_filter).trim();
    if (parsedArgs.project_description_filter) validatedFilters.project_description_filter = String(parsedArgs.project_description_filter).trim();
    if (parsedArgs.current_project_search) validatedFilters.current_project_search = String(parsedArgs.current_project_search).trim();
    
    // Array filters
    if (parsedArgs.technology_filter && Array.isArray(parsedArgs.technology_filter)) {
      validatedFilters.technology_filter = parsedArgs.technology_filter
        .map((tech: any) => String(tech).trim())
        .filter((tech: string) => tech.length > 0);
    }
    
    // Numeric filters with validation
    if (parsedArgs.min_experience_years !== undefined) {
      const val = Number(parsedArgs.min_experience_years);
      if (!isNaN(val) && val >= 0 && val <= 50) validatedFilters.min_experience_years = val;
    }
    if (parsedArgs.max_experience_years !== undefined) {
      const val = Number(parsedArgs.max_experience_years);
      if (!isNaN(val) && val >= 0 && val <= 50) validatedFilters.max_experience_years = val;
    }
    if (parsedArgs.min_graduation_year !== undefined) {
      const val = Number(parsedArgs.min_graduation_year);
      if (!isNaN(val) && val >= 1950 && val <= 2030) validatedFilters.min_graduation_year = val;
    }
    if (parsedArgs.max_graduation_year !== undefined) {
      const val = Number(parsedArgs.max_graduation_year);
      if (!isNaN(val) && val >= 1950 && val <= 2030) validatedFilters.max_graduation_year = val;
    }
    
    // Resource planning filters
    if (parsedArgs.min_engagement_percentage !== undefined) {
      const val = Number(parsedArgs.min_engagement_percentage);
      if (!isNaN(val) && val >= 0 && val <= 100) validatedFilters.min_engagement_percentage = val;
    }
    if (parsedArgs.max_engagement_percentage !== undefined) {
      const val = Number(parsedArgs.max_engagement_percentage);
      if (!isNaN(val) && val >= 0 && val <= 100) validatedFilters.max_engagement_percentage = val;
    }
    if (parsedArgs.min_billing_percentage !== undefined) {
      const val = Number(parsedArgs.min_billing_percentage);
      if (!isNaN(val) && val >= 0 && val <= 100) validatedFilters.min_billing_percentage = val;
    }
    if (parsedArgs.max_billing_percentage !== undefined) {
      const val = Number(parsedArgs.max_billing_percentage);
      if (!isNaN(val) && val >= 0 && val <= 100) validatedFilters.max_billing_percentage = val;
    }
    
    // Date filters
    if (parsedArgs.release_date_from) {
      const dateStr = String(parsedArgs.release_date_from);
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) validatedFilters.release_date_from = dateStr;
    }
    if (parsedArgs.release_date_to) {
      const dateStr = String(parsedArgs.release_date_to);
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) validatedFilters.release_date_to = dateStr;
    }
    
    // Enum filters
    const validAvailabilityStatuses = ['available', 'engaged', 'all'];
    if (parsedArgs.availability_status && validAvailabilityStatuses.includes(parsedArgs.availability_status)) {
      validatedFilters.availability_status = parsedArgs.availability_status;
    }
    
    const validCompletionStatuses = ['complete', 'incomplete', 'no-skills', 'no-experience', 'no-education'];
    if (parsedArgs.completion_status && validCompletionStatuses.includes(parsedArgs.completion_status)) {
      validatedFilters.completion_status = parsedArgs.completion_status;
    }

    const result: AISearchResponse = {
      filters: validatedFilters,
      confidence: Math.max(0, Math.min(1, Number(parsedArgs.confidence) || 0.5)),
      explanation: String(parsedArgs.explanation || 'AI interpreted your search query'),
      originalQuery: query
    };

    console.log('Final AI search result:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search-query function:', error);
    
    // Return fallback response
    const fallbackResponse: AISearchResponse = {
      filters: { search_query: (await req.json().catch(() => ({}))).query || '' },
      confidence: 0.3,
      explanation: `Error processing AI query: ${error.message}. Using fallback search.`,
      originalQuery: (await req.json().catch(() => ({}))).query || ''
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
