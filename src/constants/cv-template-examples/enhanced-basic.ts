
export const ENHANCED_BASIC_TEMPLATE = `<div class="cv-container">
  <!-- Header Section - Always Required -->
  <section class="cv-section cv-page-break-avoid" data-section="header">
    <div class="cv-section-content">
      <h1 class="cv-section-header">{{employee.firstName}} {{employee.lastName}}</h1>
      
      {{#ifNotEmpty employee.currentDesignation}}
        <h2 class="cv-item-header">{{employee.currentDesignation}}</h2>
      {{/ifNotEmpty}}
      
      {{#ifNotEmpty employee.email}}
        <p class="contact-info">Email: {{employee.email}}</p>
      {{else}}
        <p class="contact-info">Email: Available upon request</p>
      {{/ifNotEmpty}}
    </div>
  </section>
  
  <!-- Professional Summary - Only if biography exists -->
  {{#ifNotEmpty employee.biography}}
  <section class="cv-section cv-page-break-avoid" data-section="summary">
    <h2 class="cv-section-header">Professional Summary</h2>
    <div class="cv-section-content">
      <p>{{employee.biography}}</p>
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Technical Skills - Only if skills exist -->
  {{#ifNotEmpty employee.technicalSkills}}
  <section class="cv-section cv-page-break-avoid" data-section="technical-skills">
    <h2 class="cv-section-header">Technical Skills</h2>
    <div class="cv-section-content">
      <div class="cv-item-group">
        {{#each employee.technicalSkills}}
        <div class="cv-item">
          <span class="skill-name">{{this.name}}</span>
          <span class="skill-level">{{this.proficiency | formatProficiency}} ({{this.proficiency}}/10)</span>
        </div>
        {{/each}}
      </div>
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Specialized Skills - Only if skills exist -->
  {{#ifNotEmpty employee.specializedSkills}}
  <section class="cv-section cv-page-break-avoid" data-section="specialized-skills">
    <h2 class="cv-section-header">Specialized Skills</h2>
    <div class="cv-section-content">
      <div class="cv-item-group">
        {{#each employee.specializedSkills}}
        <div class="cv-item">
          <span class="skill-name">{{this.name}}</span>
          <span class="skill-level">{{this.proficiency | formatProficiency}} ({{this.proficiency}}/10)</span>
        </div>
        {{/each}}
      </div>
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Work Experience - Only if experiences exist -->
  {{#ifNotEmpty employee.experiences}}
  <section class="cv-section" data-section="experience">
    <h2 class="cv-section-header">Work Experience</h2>
    <div class="cv-item-group">
      {{#each employee.experiences}}
      <div class="cv-item cv-page-break-avoid" data-item="experience">
        <h3 class="cv-item-header">{{this.designation}} at {{this.companyName}}</h3>
        <div class="cv-item-content">
          <p class="duration">
            <strong>
              {{this.startDate | formatDate}} - 
              {{#if this.isCurrent}}
                Present
              {{else}}
                {{this.endDate | formatDate | defaultValue:"End Date TBD"}}
              {{/if}}
            </strong>
          </p>
          {{#ifNotEmpty this.description}}
            <div class="description">{{{this.description}}}</div>
          {{/ifNotEmpty}}
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Education - Only if education exists -->
  {{#ifNotEmpty employee.education}}
  <section class="cv-section" data-section="education">
    <h2 class="cv-section-header">Education</h2>
    <div class="cv-item-group">
      {{#each employee.education}}
      <div class="cv-item cv-page-break-avoid" data-item="education">
        <h3 class="cv-item-header">{{this.degree}} in {{this.department}}</h3>
        <div class="cv-item-content">
          <p class="institution">{{this.university}}</p>
          <p class="duration">
            {{this.startDate | formatDate}} - 
            {{#if this.isCurrent}}
              Present
            {{else}}
              {{this.endDate | formatDate}}
            {{/if}}
          </p>
          {{#ifNotEmpty this.gpa}}
            <p class="gpa">GPA: {{this.gpa}}</p>
          {{/ifNotEmpty}}
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Projects - Only if projects exist -->
  {{#ifNotEmpty employee.projects}}
  <section class="cv-section" data-section="projects">
    <h2 class="cv-section-header">Projects</h2>
    <div class="cv-item-group">
      {{#each employee.projects}}
      <div class="cv-item cv-page-break-avoid" data-item="project">
        <h3 class="cv-item-header">{{this.name}}</h3>
        <div class="cv-item-content">
          {{#ifNotEmpty this.role}}
            <p class="role"><strong>Role:</strong> {{this.role}}</p>
          {{/ifNotEmpty}}
          
          <p class="duration">
            {{this.startDate | formatDate}} - 
            {{#if this.isCurrent}}
              Present
            {{else}}
              {{this.endDate | formatDate | defaultValue:"Ongoing"}}
            {{/if}}
          </p>
          
          {{#ifNotEmpty this.description}}
            <div class="description">{{this.description}}</div>
          {{/ifNotEmpty}}
          
          {{#ifNotEmpty this.responsibility}}
            <div class="responsibility"><strong>Responsibilities:</strong> {{this.responsibility}}</div>
          {{/ifNotEmpty}}
          
          {{#ifNotEmpty this.technologiesUsed}}
            <p class="technologies"><strong>Technologies:</strong> {{this.technologiesUsed | join:", "}}</p>
          {{/ifNotEmpty}}
          
          {{#ifNotEmpty this.url}}
            <p class="project-url"><strong>URL:</strong> <a href="{{this.url}}" target="_blank">{{this.url}}</a></p>
          {{/ifNotEmpty}}
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Achievements - Only if achievements exist -->
  {{#ifNotEmpty employee.achievements}}
  <section class="cv-section" data-section="achievements">
    <h2 class="cv-section-header">Achievements</h2>
    <div class="cv-item-group">
      {{#each employee.achievements}}
      <div class="cv-item cv-page-break-avoid" data-item="achievement">
        <h3 class="cv-item-header">{{this.title}}</h3>
        <div class="cv-item-content">
          {{#ifNotEmpty this.date}}
            <p class="achievement-date"><strong>Date:</strong> {{this.date | formatDate}}</p>
          {{/ifNotEmpty}}
          {{#ifNotEmpty this.description}}
            <div class="description">{{this.description}}</div>
          {{/ifNotEmpty}}
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  {{/ifNotEmpty}}
  
  <!-- Training & Certifications - Only if trainings exist -->
  {{#ifNotEmpty employee.trainings}}
  <section class="cv-section" data-section="trainings">
    <h2 class="cv-section-header">Training & Certifications</h2>
    <div class="cv-item-group">
      {{#each employee.trainings}}
      <div class="cv-item cv-page-break-avoid" data-item="training">
        <h3 class="cv-item-header">{{this.title}}</h3>
        <div class="cv-item-content">
          {{#ifNotEmpty this.provider}}
            <p class="provider"><strong>Provider:</strong> {{this.provider}}</p>
          {{/ifNotEmpty}}
          {{#ifNotEmpty this.certificationDate}}
            <p class="cert-date"><strong>Certification Date:</strong> {{this.certificationDate | formatDate}}</p>
          {{/ifNotEmpty}}
          {{#ifNotEmpty this.description}}
            <div class="description">{{this.description}}</div>
          {{/ifNotEmpty}}
          {{#ifNotEmpty this.certificateUrl}}
            <p class="cert-url"><strong>Certificate:</strong> <a href="{{this.certificateUrl}}" target="_blank">View Certificate</a></p>
          {{/ifNotEmpty}}
        </div>
      </div>
      {{/each}}
    </div>
  </section>
  {{/ifNotEmpty}}
</div>

<style>
  .cv-container {
    max-width: 210mm;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    line-height: 1.5;
    color: #333;
  }
  
  .cv-section {
    margin-bottom: 20px;
  }
  
  .cv-section-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #2563eb;
    color: #1e40af;
  }
  
  .cv-item-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #374151;
  }
  
  .cv-item {
    margin-bottom: 15px;
    padding-left: 10px;
  }
  
  .cv-item-group {
    margin-left: 10px;
  }
  
  .skill-name {
    font-weight: 500;
    margin-right: 10px;
  }
  
  .skill-level {
    font-size: 14px;
    color: #6b7280;
  }
  
  .duration {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .description {
    margin-top: 8px;
    text-align: justify;
  }
  
  .contact-info {
    margin: 5px 0;
    color: #4b5563;
  }
  
  .institution, .provider {
    font-style: italic;
    color: #6b7280;
  }
  
  .gpa, .achievement-date, .cert-date {
    font-size: 14px;
    color: #6b7280;
  }
  
  .technologies {
    margin-top: 8px;
    font-size: 14px;
  }
  
  .project-url, .cert-url {
    margin-top: 5px;
    font-size: 14px;
  }
  
  .project-url a, .cert-url a {
    color: #2563eb;
    text-decoration: none;
  }
  
  .project-url a:hover, .cert-url a:hover {
    text-decoration: underline;
  }
  
  @media print {
    .cv-container {
      margin: 0;
      padding: 10mm;
    }
    
    .cv-section-header {
      page-break-after: avoid;
    }
  }
</style>`;
