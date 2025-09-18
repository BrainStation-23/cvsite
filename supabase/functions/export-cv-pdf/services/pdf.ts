export async function generatePDFWithPuppeteer(htmlContent: string): Promise<Uint8Array> {
  const puppeteerServiceUrl = Deno.env.get('PUPPETEER_SERVICE_URL') ;
  const timeout = parseInt(Deno.env.get('PUPPETEER_TIMEOUT'));
  
  console.log('Generating PDF with Puppeteer service...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(puppeteerServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
        'Accept': 'application/pdf'
      },
      body: htmlContent,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Puppeteer service error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/pdf')) {
      throw new Error(`Unexpected response type: ${contentType}. Expected application/pdf`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('PDF generation timed out');
    }
    throw error;
  }
}
