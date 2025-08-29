
import { CV_TEMPLATE_STANDARDS } from '@/constants/cv-template-standards';

export const generateAIPrompt = () => {
  const variableDefinitions = `
## Available Template Variables

### General Information
- {{employee.firstName}} - First name
- {{employee.lastName}} - Last name  
- {{employee.email}} - Email address (may be null)
- {{employee.employeeId}} - Employee ID
- {{employee.biography}} - Biography (may be null)
- {{employee.currentDesignation}} - Current designation (may be null)
- {{employee.profileImage}} - Profile image URL (may be null)

### Technical Skills (Array - may be empty)
{{#each employee.technicalSkills}}
- {{this.name}} - Skill name
- {{this.proficiency}} - Proficiency level 1-10
{{/each}}

### Specialized Skills (Array - may be empty)
{{#each employee.specializedSkills}}
- {{this.name}} - Skill name
- {{this.proficiency}} - Proficiency level 1-10
{{/each}}

### Work Experience (Array - may be empty)
{{#each employee.experiences}}
- {{this.companyName}} - Company name
- {{this.designation}} - Job title
- {{this.startDate}} - Start date
- {{this.endDate}} - End date (may be empty for current jobs)
- {{this.description}} - Job description (may be empty)
- {{this.isCurrent}} - Boolean indicating current position
{{/each}}

### Education (Array - may be empty)
{{#each employee.education}}
- {{this.university}} - University name
- {{this.degree}} - Degree
- {{this.department}} - Department
- {{this.startDate}} - Start date
- {{this.endDate}} - End date (may be empty for current studies)
- {{this.gpa}} - GPA (may be empty)
- {{this.isCurrent}} - Boolean indicating current studies
{{/each}}

### Projects (Array - may be empty)
{{#each employee.projects}}
- {{this.name}} - Project name
- {{this.role}} - Role in project (may be empty)
- {{this.description}} - Project description (may be empty)
- {{this.responsibility}} - Responsibilities (may be empty)
- {{this.technologiesUsed}} - Technologies used (array, may be empty)
- {{this.url}} - Project URL (may be empty)
- {{this.startDate}} - Start date
- {{this.endDate}} - End date (may be empty for ongoing)
- {{this.isCurrent}} - Boolean indicating ongoing project
{{/each}}

### Achievements (Array - may be empty)
{{#each employee.achievements}}
- {{this.title}} - Achievement title
- {{this.date}} - Achievement date (may be empty)
- {{this.description}} - Achievement description (may be empty)
{{/each}}

### Training & Certifications (Array - may be empty)
{{#each employee.trainings}}
- {{this.title}} - Training title
- {{this.provider}} - Training provider (may be empty)
- {{this.certificationDate}} - Certification date (may be empty)
- {{this.certificateUrl}} - Certificate URL (may be empty)
{{/each}}
`;

  const conditionalHelpers = `
## Conditional Rendering Helpers (Handle Null/Empty Values)

### Basic Conditionals
- {{#if employee.property}} ... {{/if}} - Renders if property exists and is not empty
- {{#unless employee.property}} ... {{/unless}} - Renders if property is empty or null

### Enhanced Conditionals (Recommended)
- {{#ifNotEmpty employee.property}} ... {{/ifNotEmpty}} - Only renders if property has meaningful content
- {{#hasContent employee.property}} ... {{/hasContent}} - Strict content validation
- {{#ifEquals employee.property "value"}} ... {{/ifEquals}} - Renders if property equals specific value

### Utility Filters
- {{employee.property | defaultValue:"fallback text"}} - Shows fallback if property is empty
- {{this.array | join:", "}} - Safely joins arrays with separator
- {{this.date | formatDate:"MMM yyyy"}} - Formats dates with null handling
- {{this.proficiency | formatProficiency}} - Converts number to text (Expert, Advanced, etc.)

### Example Usage
\`\`\`handlebars
{{#ifNotEmpty employee.biography}}
  <section class="summary">
    <h2>About</h2>
    <p>{{employee.biography}}</p>
  </section>
{{/ifNotEmpty}}

{{#unless employee.email}}
  <p>Email: Available upon request</p>
{{/unless}}

<p>Contact: {{employee.email | defaultValue:"Contact HR for details"}}</p>
\`\`\`
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
- **CRITICAL: Handle null/empty values gracefully using conditionals**

${variableDefinitions}

${conditionalHelpers}

${structureGuide}

## Important Notes
1. **MUST use the specified CSS classes** for proper PDF generation and page breaks
2. **Use data-section attributes** to identify different CV sections
3. **Handle empty arrays and null values gracefully** - don't show sections if no data exists
4. **Use conditional helpers** like {{#ifNotEmpty}} instead of basic {{#if}} for better null handling
5. **Use Handlebars syntax** exactly as shown in the variable examples
6. **Ensure responsive design** that works on different screen sizes
7. **Follow ATS-friendly practices** - avoid complex layouts, use standard fonts
8. **Always check for content before rendering sections** using appropriate conditionals

## Null Handling Best Practices
- Wrap entire sections in {{#ifNotEmpty employee.arrayName}} for arrays
- Use {{#ifNotEmpty employee.property}} for optional text fields
- Provide fallbacks using {{#unless}} or | defaultValue filter
- Handle date ranges properly for current positions (check isCurrent flag)

## Template Structure Example
\`\`\`html
<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <h1 class="cv-section-header">{{employee.firstName}} {{employee.lastName}}</h1>
    <div class="cv-section-content">
      {{#ifNotEmpty employee.currentDesignation}}
        <h2>{{employee.currentDesignation}}</h2>
      {{/ifNotEmpty}}
      <p>{{employee.email | defaultValue:"Email available upon request"}}</p>
    </div>
  </section>
  
  {{#ifNotEmpty employee.experiences}}
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Work Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid">
        <h3 class="cv-item-header">{{this.designation}} at {{this.companyName}}</h3>
        <p>{{this.startDate | formatDate}} - {{#if this.isCurrent}}Present{{else}}{{this.endDate | formatDate}}{{/if}}</p>
        {{#ifNotEmpty this.description}}
          <div>{{{this.description}}}</div>
        {{/ifNotEmpty}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/ifNotEmpty}}
</div>
\`\`\`

Please create a complete, professional CV template that incorporates the attached design reference while following all the technical requirements above, especially the null handling best practices.`;
};
