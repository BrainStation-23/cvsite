
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AzureFaceClient } from './azure-client.ts';
import { ImageAnalyzer } from './image-analyzer.ts';
import { ValidationConfig } from './types.ts';

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
    // Get Azure credentials
    const azureApiKey = Deno.env.get('AZURE_FACE_API_KEY');
    const azureRegion = Deno.env.get('AZURE_FACE_API_REGION');
    const azureEndpoint = Deno.env.get('AZURE_FACE_API_ENDPOINT');

    if (!azureApiKey || !azureRegion || !azureEndpoint) {
      throw new Error('Azure Face API credentials not configured');
    }

    const config: ValidationConfig = {
      azureApiKey,
      azureRegion,
      azureEndpoint
    };

    // Parse request
    const { imageUrl, imageBase64 } = await req.json();

    // Initialize services
    const azureClient = new AzureFaceClient(config);
    const imageAnalyzer = new ImageAnalyzer();

    // Detect faces
    const faces = await azureClient.detectFaces(imageUrl, imageBase64);

    // Analyze the results
    const analysis = imageAnalyzer.analyzeImage(faces);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-profile-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isProfessionalHeadshot: false,
        isFaceCentered: false,
        hasNoSunglassesOrHats: false,
        isNotGroupPhoto: false,
        confidence: 0,
        details: {
          faceCount: 0,
          glasses: 'unknown',
          accessories: [],
          facePosition: 'unknown',
          recommendations: ['Unable to analyze image. Please try again with a clear photo.']
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
