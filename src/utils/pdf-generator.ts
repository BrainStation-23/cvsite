import html2pdf from 'html2pdf.js';
import { format } from 'path';

export const downloadAsPDF = (htmlContent: string, filename: string = 'cv') => {
  const opt = {
    filename: `${filename}.pdf`,
    image: { type: 'webp', quality: 1.0 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: { 
        orientation: 'portrait',
        format:'a4' 
      }
  };

  html2pdf().from(htmlContent).set(opt).save();
};