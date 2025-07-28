
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalContent, requirements } = await req.json();

    if (!originalContent || !requirements) {
      return new Response(
        JSON.stringify({ error: 'Missing originalContent or requirements' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Enhancing text with Gemini API...');

    const prompt = `Please rewrite the following text according to these requirements:

Do not change perspective.

Requirements: ${requirements}

Original text: "${originalContent}"

Please provide only the enhanced text without any additional explanations or formatting.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
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
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to enhance text' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!enhancedText) {
      return new Response(
        JSON.stringify({ error: 'No enhanced text received' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Text enhancement successful');

    return new Response(
      JSON.stringify({ enhancedText: enhancedText.trim() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-enhance-rewrite function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
