
export const EXAMPLE_CV_TEMPLATE = `<div class="cv-container">
  <!-- Header Section -->
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <div class="cv-item">
      <h1 class="cv-item-header" style="font-size: 28px; color: #2c3e50; margin-bottom: 5px;">
        {{employee.firstName}} {{employee.lastName}}
      </h1>
      <div class="cv-item-content">
        <p style="font-size: 16px; color: #7f8c8d; margin: 0;">
          {{employee.email}} | {{employee.currentDesignation}}
        </p>
      </div>
    </div>
  </section>

  <!-- Professional Summary -->
  <section class="cv-section cv-page-break-avoid" data-section="summary">
    <h2 class="cv-section-header" style="font-size: 20px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">
      Professional Summary
    </h2>
    <div class="cv-section-content">
      <p style="line-height: 1.6; color: #34495e;">{{employee.biography}}</p>
    </div>
  </section>

  <!-- Work Experience -->
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header" style="font-size: 20px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">
      Professional Experience
    </h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid" data-item="experience-{{@index}}" style="margin-bottom: 20px;">
        <div class="cv-item-header">
          <h3 style="font-size: 18px; color: #2c3e50; margin: 0;">{{this.designation}}</h3>
          <h4 style="font-size: 16px; color: #3498db; margin: 2px 0;">{{this.companyName}}</h4>
        </div>
        <div class="cv-item-content">
          <p style="font-size: 14px; color: #7f8c8d; margin: 5px 0;"><strong>{{this.dateRange}}</strong></p>
          <div style="color: #34495e; line-height: 1.5;">{{{this.description}}}</div>
        </div>
      </div>
      {{/each}}
    </div>
  </section>

  <!-- Education -->
  <section class="cv-section" data-section="education">
    <h2 class="cv-section-header" style="font-size: 20px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">
      Education
    </h2>
    <div class="cv-item-group">
      {{#each employee.education}}
      <div class="cv-item cv-page-break-avoid" data-item="education-{{@index}}" style="margin-bottom: 15px;">
        <div class="cv-item-header">
          <h3 style="font-size: 16px; color: #2c3e50; margin: 0;">{{this.degree}} - {{this.department}}</h3>
          <h4 style="font-size: 14px; color: #3498db; margin: 2px 0;">{{this.university}}</h4>
        </div>
        <div class="cv-item-content">
          <p style="font-size: 14px; color: #7f8c8d; margin: 0;">
            {{this.startDate | formatDate}} - {{this.endDate | formatDate}}
            {{#if this.cgpa}}<strong> | CGPA: {{this.cgpa}}</strong>{{/if}}
          </p>
        </div>
      </div>
      {{/each}}
    </div>
  </section>

  <!-- Technical Skills -->
  <section class="cv-section cv-page-break-avoid" data-section="skills">
    <h2 class="cv-section-header" style="font-size: 20px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">
      Technical Skills
    </h2>
    <div class="cv-section-content">
      <div class="cv-item-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        {{#each employee.technicalSkills}}
        <div class="cv-item" data-item="skill-{{@index}}" style="background: #f8f9fa; padding: 8px 12px; border-radius: 4px;">
          <span class="cv-item-header" style="font-weight: 600; color: #2c3e50;">{{this.name}}</span>
          <span class="cv-item-content" style="color: #7f8c8d;"> - {{this.proficiency | formatProficiency}}</span>
        </div>
        {{/each}}
      </div>
    </div>
  </section>
</div>`;

export const MINIMAL_CV_TEMPLATE = `<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <h1 class="cv-section-header">{{employee.firstName}} {{employee.lastName}}</h1>
    <p>{{employee.email}} | {{employee.currentDesignation}}</p>
  </section>
  
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid">
        <h3 class="cv-item-header">{{this.designation}} at {{this.companyName}}</h3>
        <p>{{this.dateRange}}</p>
        <div>{{{this.description}}}</div>
      </div>
      {{/each}}
    </div>
  </section>
</div>`;
