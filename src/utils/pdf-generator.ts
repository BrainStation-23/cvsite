
import html2pdf from 'html2pdf.js';

export const downloadAsPDF = (htmlContent: string, filename: string = 'cv') => {
  const opt = {
    filename: `${filename}.pdf`,
    margin: [15, 15, 15, 15], // top, right, bottom, left in mm
    image: { 
      type: 'webp', 
      quality: 1.0 
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: { 
      orientation: 'portrait',
      format: 'a4',
      unit: 'mm'
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.html2pdf__page-break',
      after: '.html2pdf__page-break',
      avoid: '.no-break'
    }
  };

  html2pdf().from(htmlContent).set(opt).save();
};
