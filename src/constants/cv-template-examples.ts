
export const STRUCTURE_EXAMPLES = {
  basic: `<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <h1 class="cv-section-header">{{employee.firstName}} {{employee.lastName}}</h1>
    <div class="cv-section-content">
      <p>{{employee.email}} | {{employee.currentDesignation}}</p>
    </div>
  </section>
  
  <section class="cv-section cv-page-break-avoid" data-section="summary">
    <h2 class="cv-section-header">Professional Summary</h2>
    <div class="cv-section-content">
      <p>{{employee.biography}}</p>
    </div>
  </section>
  
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Work Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid">
        <h3 class="cv-item-header">{{this.designation}} at {{this.companyName}}</h3>
        <div class="cv-item-content">
          <p><strong>{{this.startDate | formatDate}} - {{#if this.isCurrent}}Present{{else}}{{this.endDate | formatDate}}{{/if}}</strong></p>
          <div>{{{this.description}}}</div>
        </div>
      </div>
      {{/each}}
    </div>
  </section>
</div>`,

  advanced: `<div class="cv-container">
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <div class="cv-item">
      <h1 class="cv-item-header">{{employee.firstName}} {{employee.lastName}}</h1>
      <div class="cv-item-content">
        <p>{{employee.email}} | {{employee.currentDesignation}}</p>
      </div>
    </div>
  </section>
  
  <!-- Force page break before main content -->
  <div class="cv-page-break-before"></div>
  
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Professional Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid" data-item="experience-{{@index}}">
        <div class="cv-item-header">
          <h3>{{this.designation}}</h3>
          <h4>{{this.companyName}}</h4>
        </div>
        <div class="cv-item-content">
          <p class="cv-page-break-after"><strong>{{this.dateRange}}</strong></p>
          <div>{{{this.description}}}</div>
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  
  <section class="cv-section" data-section="skills">
    <h2 class="cv-section-header">Technical Skills</h2>
    <div class="cv-item-group">
      {{#each employee.technicalSkills}}
      <div class="cv-item" data-item="skill-{{@index}}">
        <span class="cv-item-header">{{this.name}}</span>
        <span class="cv-item-content"> - {{this.proficiency}}/10</span>
      </div>
      {{/each}}
    </div>
  </section>
</div>`
};

export const EXAMPLE_CV_TEMPLATE = STRUCTURE_EXAMPLES.basic;
