
import { AzureFaceDetectionResponse, ValidationConfig } from './types.ts';

export class AzureFaceClient {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  async detectFaces(imageUrl?: string, imageBase64?: string): Promise<AzureFaceDetectionResponse[]> {
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
      const base64Data = imageBase64!.replace(/^data:image\/[a-z]+;base64,/, '');
      requestBody = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      contentType = 'application/octet-stream';
    }

    // Call Azure Face API for face detection with attributes
    const azureResponse = await fetch(
      `${this.config.azureEndpoint}/face/v1.0/detect?returnFaceAttributes=accessories,glasses,headPose`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.azureApiKey,
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

    return faces;
  }
}
