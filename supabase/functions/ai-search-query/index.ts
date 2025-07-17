
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
  project_name_filter?: string;
  project_description_filter?: string;
  technology_filter?: string[];
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
You are an expert at parsing employee search queries and converting them into structured database filters for an employee profile management system.

Given this natural language query: "${query}"

Extract relevant search parameters and map them to these available filters based on our database structure:

## FILTER DEFINITIONS & DATABASE CONTEXT:

**search_query**: General text search across employee names, employee IDs, and biography text
- Use for: names, employee IDs, general profile information

**skill_filter**: Search in technical_skills and specialized_skills tables
- Use for: Programming languages, frameworks, software tools, technical abilities
- Examples: "React", "Python", "Machine Learning", "Data Analysis"
- NOT for: technologies used in specific projects (use technology_filter instead)

**experience_filter**: Search in experiences table (company_name, designation, description)
- Use for: Company names where someone worked, job titles, work experience descriptions
- Examples: "Google", "Senior Developer", "Microsoft", "Team Lead"
- NOT for: companies mentioned as project clients (use project filters instead)

**education_filter**: Search in education and universities tables
- Use for: University names, degree names, academic departments
- Examples: "MIT", "Computer Science", "Stanford University", "Bachelor's"

**training_filter**: Search in trainings table (title, provider, description)
- Use for: Certifications, courses, training programs, professional development
- Examples: "AWS Certified", "Scrum Master", "Google Analytics", "PMP"

**achievement_filter**: Search in achievements table (title, description)
- Use for: Awards, recognitions, accomplishments, honors
- Examples: "Employee of the Year", "Best Innovation Award", "Dean's List"

**project_filter**: General project search (legacy - avoid using, prefer specific project filters below)

**project_name_filter**: Search specifically in projects.name field
- Use for: Specific project names or when user mentions "project called X"
- Examples: "E-commerce Platform", "Mobile Banking App", "CRM System"

**project_description_filter**: Search in projects.description field
- Use for: Project details, what the project does, project domain
- Examples: "payment processing", "inventory management", "social media"

**technology_filter**: Search in projects.technologies_used array field
- Use for: Technologies, frameworks, tools used IN PROJECTS
- Examples: ["React", "Node.js"], ["Python", "TensorFlow"], ["Unity", "C#"]
- This is DIFFERENT from skill_filter - this is about what was used in projects

**Numeric Filters:**
- min_experience_years/max_experience_years: Years of work experience (0-20+ range)
- min_graduation_year/max_graduation_year: University graduation years (1980-2030 range)

**completion_status**: Profile completeness analysis
- Values: "complete", "incomplete", "no-skills", "no-experience", "no-education"

## DISAMBIGUATION EXAMPLES:

"React developers" → skill_filter: "React" (they have React as a skill)
"Projects using React" → technology_filter: ["React"] (React was used in their projects)

"worked at Google" → experience_filter: "Google" (employment history)
"Google project" → project_name_filter: "Google" OR project_description_filter: "Google" (project client/name)

"Unity developer" → skill_filter: "Unity" (has Unity as a skill)
"Unity game project" → technology_filter: ["Unity"] (used Unity in a project)

"5 years experience" → min_experience_years: 5
"5+ years experience" → min_experience_years: 5
"3-7 years experience" → min_experience_years: 3, max_experience_years: 7

"MIT graduates" → education_filter: "MIT"
"Computer Science degree" → education_filter: "Computer Science"

"AWS certified" → training_filter: "AWS"
"Machine Learning skills" → skill_filter: "Machine Learning"

Return a JSON response with this exact structure:
{
  "filters": {
    // Only include filters that are clearly indicated by the query
  },
  "confidence": 0.95, // 0-1 confidence score
  "explanation": "Brief explanation of how the query was interpreted"
}

## IMPORTANT RULES:
1. Only include filters that are CLEARLY indicated by the query
2. Be conservative - better to miss a filter than include incorrect ones
3. For technologies, distinguish between personal skills vs project usage
4. For companies, distinguish between employment vs project clients
5. Use arrays for technology_filter: ["React", "Node.js"] not just "React"
6. Confidence should reflect certainty about the interpretation
7. If unclear whether something is a skill or project technology, prefer skill_filter
8. Always explain your reasoning in the explanation field

Examples of good confidence scores:
- 0.9+: Very clear queries like "React developers with 5+ years"
- 0.7-0.9: Clear intent but some ambiguity "frontend developers"
- 0.5-0.7: Multiple possible interpretations "Google engineers"
- <0.5: Very ambiguous or unclear queries
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
    if (parsedResponse.filters.project_name_filter) {
      validatedFilters.project_name_filter = String(parsedResponse.filters.project_name_filter).trim();
    }
    if (parsedResponse.filters.project_description_filter) {
      validatedFilters.project_description_filter = String(parsedResponse.filters.project_description_filter).trim();
    }
    
    // Handle technology filter (array of strings)
    if (parsedResponse.filters.technology_filter && Array.isArray(parsedResponse.filters.technology_filter)) {
      validatedFilters.technology_filter = parsedResponse.filters.technology_filter
        .map(tech => String(tech).trim())
        .filter(tech => tech.length > 0);
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
