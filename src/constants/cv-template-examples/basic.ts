
export const BASIC_TEMPLATE = `<div class="cv-container">
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
</div>`;
