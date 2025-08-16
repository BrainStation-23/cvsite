
import html2pdf from 'html2pdf.js';

export const generatePDFFromHTML = (html: string, filename: string = 'cv.pdf'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = html;
      element.style.width = '210mm';
      element.style.minHeight = '297mm';
      element.style.background = 'white';
      element.style.padding = '20mm';
      element.style.boxSizing = 'border-box';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.fontSize = '14px';
      element.style.lineHeight = '1.6';
      element.style.color = '#333';

      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123 // A4 height in pixels at 96 DPI
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};
