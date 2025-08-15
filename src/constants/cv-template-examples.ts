
export const EXAMPLE_CV_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - {{employee.firstName}} {{employee.lastName}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #007bff;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 1.4em;
        }
        .item {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            border-radius: 5px;
        }
        .item h3 {
            margin: 0 0 8px 0;
            color: #333;
        }
        .skill-item {
            display: inline-block;
            margin: 5px 10px 5px 0;
            padding: 8px 15px;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .date-range {
            font-style: italic;
            color: #6c757d;
            font-size: 0.9em;
        }
        .technologies {
            color: #28a745;
            font-weight: 600;
            background-color: #d4edda;
            padding: 5px 10px;
            border-radius: 15px;
            display: inline-block;
            margin-top: 5px;
        }
        .profile-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 15px;
            border: 4px solid #007bff;
        }
        .contact-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .gpa-highlight {
            background-color: #fff3cd;
            padding: 3px 8px;
            border-radius: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            {{#if employee.profileImage}}
            <img src="{{employee.profileImage}}" alt="Profile Photo" class="profile-img">
            {{/if}}
            <h1>{{employee.firstName}} {{employee.lastName}}</h1>
            <div class="contact-info">
                <p><strong>Employee ID:</strong> {{employee.employeeId}}</p>
                <p><strong>Email:</strong> {{employee.email}}</p>
                {{#if employee.currentDesignation}}
                <p><strong>Current Designation:</strong> {{employee.currentDesignation}}</p>
                {{/if}}
            </div>
        </div>

        <!-- Biography Section -->
        {{#if employee.biography}}
        <div class="section">
            <h2>Professional Summary</h2>
            <p>{{employee.biography | truncate:500}}</p>
        </div>
        {{/if}}

        <!-- Technical Skills Section -->
        {{#if employee.technicalSkills}}
        <div class="section">
            <h2>Technical Skills</h2>
            {{#each employee.technicalSkills}}
            <span class="skill-item">{{this.name}} ({{this.proficiency | formatProficiency}})</span>
            {{/each}}
        </div>
        {{/if}}

        <!-- Specialized Skills Section -->
        {{#if employee.specializedSkills}}
        <div class="section">
            <h2>Specialized Skills</h2>
            {{#each employee.specializedSkills}}
            <span class="skill-item">{{this.name}} ({{this.proficiency | formatProficiency}})</span>
            {{/each}}
        </div>
        {{/if}}

        <!-- Work Experience Section -->
        {{#if employee.experiences}}
        <div class="section">
            <h2>Work Experience</h2>
            {{#each employee.experiences}}
            <div class="item">
                <h3>{{this.designation}} at {{this.companyName}}</h3>
                <p class="date-range">{{this.dateRange}}</p>
                {{#if this.description}}
                <p>{{this.description}}</p>
                {{/if}}
            </div>
            {{/each}}
        </div>
        {{/if}}

        <!-- Education Section -->
        {{#if employee.education}}
        <div class="section">
            <h2>Education</h2>
            {{#each employee.education}}
            <div class="item">
                <h3>{{this.degree}} in {{this.department}}</h3>
                <p><strong>University:</strong> {{this.university}}</p>
                <p class="date-range">{{this.startDate | formatDate}} - {{this.endDate | formatDate}}</p>
                {{#if this.gpa}}
                <p><span class="gpa-highlight">GPA: {{this.gpa}}</span></p>
                {{/if}}
            </div>
            {{/each}}
        </div>
        {{/if}}

        <!-- Projects Section -->
        {{#if employee.projects}}
        <div class="section">
            <h2>Key Projects</h2>
            {{#each employee.projects}}
            <div class="item">
                <h3>{{this.name}}</h3>
                {{#if this.role}}
                <p><strong>Role:</strong> {{this.role}}</p>
                {{/if}}
                <p>{{this.description}}</p>
                {{#if this.responsibility}}
                <p><strong>Key Responsibilities:</strong> {{this.responsibility}}</p>
                {{/if}}
                {{#if this.technologiesUsed}}
                <p><span class="technologies">Technologies: {{this.technologiesUsed | join:", "}}</span></p>
                {{/if}}
                {{#if this.url}}
                <p><a href="{{this.url}}" target="_blank">🔗 View Project</a></p>
                {{/if}}
            </div>
            {{/each}}
        </div>
        {{/if}}

        <!-- Training & Certifications Section -->
        {{#if employee.trainings}}
        <div class="section">
            <h2>Training & Certifications</h2>
            {{#each employee.trainings}}
            <div class="item">
                <h3>{{this.title}}</h3>
                {{#if this.provider}}
                <p><strong>Provider:</strong> {{this.provider}}</p>
                {{/if}}
                {{#if this.certificationDate}}
                <p class="date-range">Completed: {{this.certificationDate | formatDate}}</p>
                {{/if}}
                {{#if this.certificateUrl}}
                <p><a href="{{this.certificateUrl}}" target="_blank">📜 View Certificate</a></p>
                {{/if}}
            </div>
            {{/each}}
        </div>
        {{/if}}

        <!-- Achievements Section -->
        {{#if employee.achievements}}
        <div class="section">
            <h2>Notable Achievements</h2>
            {{#each employee.achievements}}
            <div class="item">
                <h3>{{this.title}}</h3>
                {{#if this.description}}
                <p>{{this.description}}</p>
                {{/if}}
                {{#if this.date}}
                <p class="date-range">{{this.date | formatDate}}</p>
                {{/if}}
            </div>
            {{/each}}
        </div>
        {{/if}}
    </div>
</body>
</html>`;
