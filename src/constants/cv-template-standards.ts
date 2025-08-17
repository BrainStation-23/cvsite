
export const CV_TEMPLATE_STANDARDS = {
  // Required CSS classes for page break control
  PAGE_BREAK_CLASSES: {
    'cv-page-break-before': 'page-break-before: always; padding-top: 20mm;',
    'cv-page-break-after': 'page-break-after: always;',
    'cv-page-break-avoid': 'page-break-inside: avoid;',
    'cv-page-break-auto': 'page-break-inside: auto;',
  },
  
  // Section-level classes
  SECTION_CLASSES: {
    'cv-container': 'Main container for the entire CV',
    'cv-section': 'Individual CV sections (header, experience, etc.)',
    'cv-section-header': 'Section headers/titles',
    'cv-section-content': 'Section content wrapper',
  },
  
  ITEM_CLASSES: {
    'cv-item': 'Individual items within sections (jobs, education)',
    'cv-item-group': 'Groups of related items',
    'cv-item-header': 'Headers for individual items',
    'cv-item-content': 'Content of individual items',
  },
  
  DATA_ATTRIBUTES: {
    'data-section': 'Identifies the section type (header, experience, education, skills, etc.)',
    'data-item': 'Identifies individual items within sections',
  },
  
  SECTION_TYPES: [
    'header',
    'summary', 
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'awards',
    'languages',
    'references'
  ]
};

export const STANDARD_CV_CSS = `
/* CV Template Standard CSS */
/* Page Break Control Classes */
.cv-page-break-before { 
  page-break-before: always !important; 
  padding-top: 20mm !important;
}
.cv-page-break-after { 
  page-break-after: always !important; 
}
.cv-page-break-avoid { 
  page-break-inside: avoid !important; 
}
.cv-page-break-auto { 
  page-break-inside: auto !important; 
}

/* Container */
.cv-container {
  max-width: 210mm;
  margin: 0 auto;
  background: white;
  padding: 20mm;
  box-sizing: border-box;
}

/* Section-Level Classes */
.cv-section { 
  page-break-inside: avoid;
  margin-bottom: 20px;
  position: relative;
}

.cv-section-header { 
  page-break-after: avoid;
  page-break-inside: avoid;
  margin-bottom: 10px;
  font-weight: bold;
}

.cv-section-content { 
  orphans: 3;
  widows: 3;
}

/* Item-Level Classes */
.cv-item { 
  page-break-inside: avoid;
  margin-bottom: 15px;
  position: relative;
}

.cv-item-group { 
  page-break-inside: auto;
}

.cv-item-header { 
  page-break-after: avoid;
  margin-bottom: 5px;
  font-weight: 600;
}

.cv-item-content {
  margin-top: 5px;
}

/* Print-specific styles */
@media print {
  .cv-container {
    max-width: none;
    margin: 0;
    padding: 15mm;
    box-shadow: none;
  }
  
  .cv-section {
    margin-bottom: 15px;
  }
  
  .cv-item {
    margin-bottom: 10px;
  }
  
  /* Ensure padding is maintained in print mode */
  .cv-page-break-before {
    padding-top: 15mm !important;
  }
}
`;
