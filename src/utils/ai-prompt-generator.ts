
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';

export const generateAIPrompt = () => {
  const variableDefinitions = `
## Available Template Variables

### General Information
- {{employee.firstName}} - First name
- {{employee.lastName}} - Last name  
- {{employee.email}} - Email address
- {{employee.employeeId}} - Employee ID
- {{employee.biography}} - Biography
- {{employee.currentDesignation}} - Current designation
- {{employee.profileImage}} - Profile image URL

### Technical Skills (Array)
{{#each employee.technicalSkills}}
- {{this.name}} - Skill name
- {{this.proficiency}} - Proficiency level 1-10
{{/each}}

### Work Experience (Array)
{{#each employee.experiences}}
- {{this.companyName}} - Company name
- {{this.designation}} - Job title
- {{this.startDate}} - Start date
- {{this.endDate}} - End date
- {{this.description}} - Job description
{{/each}}

### Education (Array)
{{#each employee.education}}
- {{this.university}} - University name
- {{this.degree}} - Degree
- {{this.department}} - Department
- {{this.startDate}} - Start date
- {{this.endDate}} - End date
- {{this.gpa}} - GPA
{{/each}}

### Projects (Array)
{{#each employee.projects}}
- {{this.name}} - Project name
- {{this.role}} - Role in project
- {{this.description}} - Project description
- {{this.responsibility}} - Responsibilities
- {{this.technologiesUsed}} - Technologies used (array)
{{/each}}

### Training & Certifications (Array)
{{#each employee.trainings}}
- {{this.title}} - Training title
- {{this.provider}} - Training provider
- {{this.certificationDate}} - Certification date
- {{this.certificateUrl}} - Certificate URL
{{/each}}
`;

  const structureGuide = `
## Required CSS Classes for PDF Generation

### Page Break Control (CRITICAL for multi-page CVs)
${Object.entries(CV_TEMPLATE_STANDARDS.PAGE_BREAK_CLASSES)
  .map(([className, description]) => `- .${className} - ${description}`)
  .join('\n')}

### Section Classes
${Object.entries(CV_TEMPLATE_STANDARDS.SECTION_CLASSES)
  .map(([className, description]) => `- .${className} - ${description}`)
  .join('\n')}

### Item Classes  
${Object.entries(CV_TEMPLATE_STANDARDS.ITEM_CLASSES)
  .map(([className, description]) => `- .${className} - ${description}`)
  .join('\n')}

### Data Attributes
${Object.entries(CV_TEMPLATE_STANDARDS.DATA_ATTRIBUTES)
  .map(([attr, description]) => `- ${attr} - ${description}`)
  .join('\n')}

### Section Types
Supported section types: ${CV_TEMPLATE_STANDARDS.SECTION_TYPES.join(', ')}
`;

  return `# CV Template Design Request

I need you to create a professional CV template using the following specifications. The expected design reference is provided as an attachment.

## Template Requirements
- Create a modern, professional CV template
- Use responsive HTML with inline CSS or CSS classes
- Ensure ATS-friendly formatting
- Design should work well for PDF generation
- Include proper page break handling for multi-page CVs

${variableDefinitions}

${structureGuide}

## Important Notes
1. **MUST use the specified CSS classes** for proper PDF generation and page breaks
2. **Use data-section attributes** to identify different CV sections
3. **Handle empty arrays gracefully** - don't show sections if no data exists
4. **Use Handlebars syntax** exactly as shown in the variable examples
5. **Ensure responsive design** that works on different screen sizes
6. **Follow ATS-friendly practices** - avoid complex layouts, use standard fonts

## Template Structure Example
\`\`\`html
<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <h1 class="cv-section-header">{{employee.firstName}} {{employee.lastName}}</h1>
    <div class="cv-section-content">
      <!-- Header content -->
    </div>
  </section>
  
  <!-- Additional sections following the same pattern -->
</div>
\`\`\`

Please create a complete, professional CV template that incorporates the attached design reference while following all the technical requirements above.`;
};
