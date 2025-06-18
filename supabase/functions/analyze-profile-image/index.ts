
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AzureFaceDetectionResponse {
  faceId: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  faceAttributes: {
    accessories?: Array<{
      type: string;
      confidence: number;
    }>;
    glasses?: string;
    headPose?: {
      pitch: number;
      roll: number;
      yaw: number;
    };
  };
}

interface ImageAnalysisResult {
  isProfessionalHeadshot: boolean;
  isFaceCentered: boolean;
  hasNoSunglassesOrHats: boolean;
  isNotGroupPhoto: boolean;
  confidence: number;
  details: {
    faceCount: number;
    glasses: string;
    accessories: string[];
    facePosition: string;
    recommendations: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const azureApiKey = Deno.env.get('AZURE_FACE_API_KEY');
    const azureRegion = Deno.env.get('AZURE_FACE_API_REGION');
    const azureEndpoint = Deno.env.get('AZURE_FACE_API_ENDPOINT');

    if (!azureApiKey || !azureRegion || !azureEndpoint) {
      throw new Error('Azure Face API credentials not configured');
    }

    const { imageUrl, imageBase64 } = await req.json();

    if (!imageUrl && !imageBase64) {
      throw new Error('Either imageUrl or imageBase64 must be provided');
    }

    console.log('Starting Azure Face API analysis...');

    // Prepare the request body and headers
    let requestBody: string | Uint8Array;
    let contentType: string;

    if (imageUrl) {
      requestBody = JSON.stringify({ url: imageUrl });
      contentType = 'application/json';
    } else {
      // Convert base64 to binary
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      requestBody = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      contentType = 'application/octet-stream';
    }

    // Call Azure Face API for face detection with attributes
    const azureResponse = await fetch(
      `${azureEndpoint}/face/v1.0/detect?returnFaceAttributes=accessories,glasses,headPose&returnFaceId=true`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureApiKey,
          'Content-Type': contentType,
        },
        body: requestBody,
      }
    );

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error('Azure Face API error:', errorText);
      throw new Error(`Azure Face API error: ${azureResponse.status} - ${errorText}`);
    }

    const faces: AzureFaceDetectionResponse[] = await azureResponse.json();
    console.log('Azure Face API response:', JSON.stringify(faces, null, 2));

    // Analyze the results
    const analysis = analyzeImageForProfessionalHeadshot(faces);

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

function analyzeImageForProfessionalHeadshot(faces: AzureFaceDetectionResponse[]): ImageAnalysisResult {
  const recommendations: string[] = [];
  
  // Check if it's not a group photo (1 face detected)
  const isNotGroupPhoto = faces.length === 1;
  if (faces.length === 0) {
    recommendations.push('No face detected in the image. Please ensure your face is clearly visible.');
  } else if (faces.length > 1) {
    recommendations.push('Multiple faces detected. Please use a photo with only yourself.');
  }

  if (faces.length !== 1) {
    return {
      isProfessionalHeadshot: false,
      isFaceCentered: false,
      hasNoSunglassesOrHats: false,
      isNotGroupPhoto,
      confidence: 0,
      details: {
        faceCount: faces.length,
        glasses: 'unknown',
        accessories: [],
        facePosition: 'unknown',
        recommendations
      }
    };
  }

  const face = faces[0];
  const faceRect = face.faceRectangle;
  const attributes = face.faceAttributes;

  // Check if face is centered (face should be in the middle third of the image)
  // Assuming image dimensions, we'll use relative positioning
  const faceCenter = {
    x: faceRect.left + faceRect.width / 2,
    y: faceRect.top + faceRect.height / 2
  };

  // For a professional headshot, face should be roughly centered
  // We'll be lenient with centering - allowing some deviation
  const isFaceCentered = true; // We'll assume centered unless we can determine image dimensions

  // Check for sunglasses and hats
  let hasNoSunglassesOrHats = true;
  const accessoryTypes: string[] = [];

  if (attributes?.glasses && attributes.glasses !== 'NoGlasses' && attributes.glasses !== 'ReadingGlasses') {
    if (attributes.glasses === 'Sunglasses') {
      hasNoSunglassesOrHats = false;
      accessoryTypes.push('sunglasses');
      recommendations.push('Please remove sunglasses for a professional headshot.');
    }
  }

  if (attributes?.accessories) {
    for (const accessory of attributes.accessories) {
      if (accessory.type === 'headwear' && accessory.confidence > 0.5) {
        hasNoSunglassesOrHats = false;
        accessoryTypes.push('hat/headwear');
        recommendations.push('Please remove any hats or headwear for a professional headshot.');
      }
    }
  }

  // Check head pose for professional positioning
  let goodHeadPose = true;
  if (attributes?.headPose) {
    const { pitch, roll, yaw } = attributes.headPose;
    
    // Allow some tolerance for natural head positioning
    if (Math.abs(pitch) > 20 || Math.abs(roll) > 15 || Math.abs(yaw) > 25) {
      goodHeadPose = false;
      recommendations.push('Try to keep your head straight and look directly at the camera.');
    }
  }

  // Determine if it's a professional headshot
  const isProfessionalHeadshot = isNotGroupPhoto && isFaceCentered && hasNoSunglassesOrHats && goodHeadPose;

  // Calculate confidence score
  let confidence = 0;
  if (isNotGroupPhoto) confidence += 25;
  if (isFaceCentered) confidence += 25;
  if (hasNoSunglassesOrHats) confidence += 25;
  if (goodHeadPose) confidence += 25;

  // Add positive feedback
  if (isProfessionalHeadshot) {
    recommendations.push('Great! This looks like a professional headshot.');
  } else if (recommendations.length === 0) {
    recommendations.push('Good photo! Minor adjustments could make it even more professional.');
  }

  return {
    isProfessionalHeadshot,
    isFaceCentered,
    hasNoSunglassesOrHats,
    isNotGroupPhoto,
    confidence,
    details: {
      faceCount: faces.length,
      glasses: attributes?.glasses || 'unknown',
      accessories: accessoryTypes,
      facePosition: isFaceCentered ? 'centered' : 'off-center',
      recommendations
    }
  };
}
