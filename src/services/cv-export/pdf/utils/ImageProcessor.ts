
import jsPDF from 'jspdf';

export class ImageProcessor {
  private doc: jsPDF;

  constructor(doc: jsPDF) {
    this.doc = doc;
  }

  async addProfileImageHighRes(imageUrl: string, x: number, y: number, width: number): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas with original dimensions to maintain quality
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate display size while maintaining aspect ratio
          const maxDisplayWidth = 40;
          const maxDisplayHeight = 50;
          const { width: imgWidth, height: imgHeight } = img;
          
          // Calculate scaled display dimensions
          const displayRatio = Math.min(maxDisplayWidth / imgWidth, maxDisplayHeight / imgHeight);
          const displayWidth = imgWidth * displayRatio;
          const displayHeight = imgHeight * displayRatio;
          
          // Use higher canvas resolution for better quality
          const scaleFactor = Math.min(2, Math.max(1, 300 / Math.max(imgWidth, imgHeight)));
          canvas.width = imgWidth * scaleFactor;
          canvas.height = imgHeight * scaleFactor;
          
          // Draw image at high resolution
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Get high quality base64 data
          const dataUrl = canvas.toDataURL('image/png', 1.0); // Use PNG and max quality
          
          // Add image to PDF (centered) with display dimensions
          const imageX = x + (width - displayWidth) / 2;
          this.doc.addImage(dataUrl, 'PNG', imageX, y, displayWidth, displayHeight);
          
          resolve(displayHeight);
        } catch (error) {
          console.warn('Error processing profile image:', error);
          resolve(0);
        }
      };
      
      img.onerror = () => {
        console.warn('Failed to load profile image');
        resolve(0);
      };
      
      img.src = imageUrl;
    });
  }
}
