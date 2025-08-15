
export const extractCSSFromHTML = (htmlString: string) => {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Extract all style elements
  const styleElements = tempDiv.querySelectorAll('style');
  let extractedCSS = '';
  
  styleElements.forEach(styleEl => {
    extractedCSS += styleEl.textContent || '';
    styleEl.remove(); // Remove from the HTML
  });

  // Extract inline styles from style attributes and convert to CSS rules
  const elementsWithStyle = tempDiv.querySelectorAll('[style]');
  let inlineCSS = '';
  
  elementsWithStyle.forEach((element, index) => {
    const styles = element.getAttribute('style');
    if (styles) {
      const className = `inline-style-${index}`;
      element.setAttribute('class', `${element.className} ${className}`.trim());
      inlineCSS += `.${className} { ${styles} }\n`;
      element.removeAttribute('style');
    }
  });

  console.log('CSS Extractor: Extracted CSS length:', extractedCSS.length + inlineCSS.length);
  console.log('CSS Extractor: Clean HTML length:', tempDiv.innerHTML.length);

  return {
    css: extractedCSS + inlineCSS,
    html: tempDiv.innerHTML
  };
};
