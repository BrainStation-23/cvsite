
import html2pdf from 'html2pdf.js';

export const downloadAsPDF = (htmlContent: string, filename: string = 'cv') => {
  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(htmlContent).set(opt).save();
};
