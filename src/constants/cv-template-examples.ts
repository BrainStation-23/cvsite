
export const EXAMPLE_CV_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - {{employee.firstName}} {{employee.lastName}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
        }
        .item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 3px solid #3498db;
        }
        .skill-item {
            display: inline-block;
            margin: 5px 10px 5px 0;
            padding: 5px 10px;
            background-color: #e74c3c;
            color: white;
            border-radius: 15px;
            font-size: 14px;
        }
        .date-range {
            font-style: italic;
            color: #7f8c8d;
        }
        .technologies {
            color: #8e44ad;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        {{#if employee.profileImage}}
        <img src="{{employee.profileImage}}" alt="Profile Photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 15px;">
        {{/if}}
        <h1>{{employee.firstName}} {{employee.lastName}}</h1>
        <p><strong>Employee ID:</strong> {{employee.employeeId}}</p>
        <p><strong>Email:</strong> {{employee.email}}</p>
        {{#if employee.currentDesignation}}
        <p><strong>Current Designation:</strong> {{employee.currentDesignation}}</p>
        {{/if}}
    </div>

    <!-- Biography Section -->
    {{#if employee.biography}}
    <div class="section">
        <h2>Biography</h2>
        <p>{{employee.biography}}</p>
    </div>
    {{/if}}

    <!-- Technical Skills Section -->
    <div class="section">
        <h2>Technical Skills</h2>
        {{#each employee.technicalSkills}}
        <span class="skill-item">{{this.name}} ({{this.proficiency}}/10)</span>
        {{/each}}
    </div>

    <!-- Specialized Skills Section -->
    <div class="section">
        <h2>Specialized Skills</h2>
        {{#each employee.specializedSkills}}
        <span class="skill-item">{{this.name}} ({{this.proficiency}}/10)</span>
        {{/each}}
    </div>

    <!-- Work Experience Section -->
    <div class="section">
        <h2>Work Experience</h2>
        {{#each employee.experiences}}
        <div class="item">
            <h3>{{this.designation}} at {{this.companyName}}</h3>
            <p class="date-range">{{this.startDate}} - {{this.endDate}}</p>
            {{#if this.description}}
            <p>{{this.description}}</p>
            {{/if}}
        </div>
        {{/each}}
    </div>

    <!-- Education Section -->
    <div class="section">
        <h2>Education</h2>
        {{#each employee.education}}
        <div class="item">
            <h3>{{this.degree}} - {{this.department}}</h3>
            <p><strong>University:</strong> {{this.university}}</p>
            <p class="date-range">{{this.startDate}} - {{this.endDate}}</p>
            {{#if this.gpa}}
            <p><strong>GPA:</strong> {{this.gpa}}</p>
            {{/if}}
        </div>
        {{/each}}
    </div>

    <!-- Projects Section -->
    <div class="section">
        <h2>Projects</h2>
        {{#each employee.projects}}
        <div class="item">
            <h3>{{this.name}}</h3>
            {{#if this.role}}
            <p><strong>Role:</strong> {{this.role}}</p>
            {{/if}}
            <p>{{this.description}}</p>
            {{#if this.responsibility}}
            <p><strong>Responsibilities:</strong> {{this.responsibility}}</p>
            {{/if}}
            {{#if this.technologiesUsed}}
            <p class="technologies">Technologies: {{this.technologiesUsed}}</p>
            {{/if}}
        </div>
        {{/each}}
    </div>

    <!-- Training & Certifications Section -->
    <div class="section">
        <h2>Training & Certifications</h2>
        {{#each employee.trainings}}
        <div class="item">
            <h3>{{this.title}}</h3>
            {{#if this.provider}}
            <p><strong>Provider:</strong> {{this.provider}}</p>
            {{/if}}
            {{#if this.certificationDate}}
            <p class="date-range">Completed: {{this.certificationDate}}</p>
            {{/if}}
            {{#if this.certificateUrl}}
            <p><a href="{{this.certificateUrl}}" target="_blank">View Certificate</a></p>
            {{/if}}
        </div>
        {{/each}}
    </div>

    <!-- Achievements Section -->
    <div class="section">
        <h2>Achievements</h2>
        {{#each employee.achievements}}
        <div class="item">
            <h3>{{this.title}}</h3>
            <p>{{this.description}}</p>
            {{#if this.date}}
            <p class="date-range">{{this.date}}</p>
            {{/if}}
        </div>
        {{/each}}
    </div>
</body>
</html>`;
