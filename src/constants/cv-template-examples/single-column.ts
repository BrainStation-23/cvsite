
export const SINGLE_COLUMN_TEMPLATE = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - {{employee.firstName}} {{employee.lastName}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f0f2f5;
        }

        .cv-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        /* Header Section */
        .cv-header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }

        .profile-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 20px;
            border: 5px solid white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        }

        .cv-header h1 {
            font-size: 2.5em;
            margin: 0 0 10px 0;
            font-weight: 700;
        }

        .cv-header h2 {
            font-size: 1.5em;
            margin: 0;
            font-weight: 400;
            opacity: 0.9;
        }

        /* Main Content */
        .cv-content {
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section h2 {
            color: #2c3e50;
            font-size: 1.8em;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
            position: relative;
        }

        .section h2::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 50px;
            height: 3px;
            background-color: #e74c3c;
        }

        /* Biography Section */
        .biography p {
            font-size: 1.1em;
            line-height: 1.7;
            color: #555;
            text-align: justify;
        }

        /* Skills Grid Layout */
        .skills-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 20px;
        }

        .skills-section h3 {
            color: #2c3e50;
            font-size: 1.3em;
            margin-bottom: 15px;
            font-weight: 600;
        }

        /* Technical Skills */
        .technical-skills .skill-item {
            margin-bottom: 15px;
        }

        .skill-item .skill-name {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-weight: 500;
        }

        .skill-bar-container {
            background-color: #ecf0f1;
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
        }

        .skill-bar {
            background: linear-gradient(90deg, #3498db, #2ecc71);
            height: 100%;
            border-radius: 5px;
            transition: width 0.3s ease;
        }

        /* English Skills */
        .english-skills .english-skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px 0;
        }

        .star-rating {
            display: flex;
            gap: 3px;
        }

        .star {
            width: 18px;
            height: 18px;
            font-size: 18px;
            color: #f39c12;
        }

        .star.empty {
            color: #bdc3c7;
        }

        /* Experience Timeline */
        .experience-timeline {
            position: relative;
            padding-left: 30px;
        }

        .experience-timeline::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: #3498db;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #3498db;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -32px;
            top: 25px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #3498db;
            border: 3px solid white;
            box-shadow: 0 0 0 3px #3498db;
        }

        .timeline-item h3 {
            margin: 0 0 5px 0;
            color: #2c3e50;
            font-size: 1.2em;
            font-weight: 600;
        }

        .timeline-item .company {
            color: #7f8c8d;
            font-weight: 500;
            margin-bottom: 5px;
        }

        .timeline-item .date-range {
            color: #95a5a6;
            font-size: 0.9em;
            font-style: italic;
        }

        /* Projects Section */
        .projects-list {
            counter-reset: project-counter;
        }

        .project-item {
            counter-increment: project-counter;
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }

        .project-item h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1.1em;
            font-weight: 600;
        }

        .project-item h3::before {
            content: counter(project-counter) ". ";
            color: #e74c3c;
            font-weight: bold;
        }

        .project-details p {
            margin: 8px 0;
            line-height: 1.5;
        }

        .project-details strong {
            color: #2c3e50;
        }

        .technologies-used {
            color: #3498db;
            font-weight: 600;
        }

        /* Education Section */
        .education-list .education-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #9b59b6;
        }

        .education-item h3 {
            margin: 0 0 5px 0;
            color: #2c3e50;
            font-weight: 600;
        }

        .education-item .university {
            color: #7f8c8d;
            margin-bottom: 3px;
        }

        .education-item .details {
            font-size: 0.9em;
            color: #95a5a6;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .skills-container {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .cv-header {
                padding: 30px 20px;
            }
            
            .cv-content {
                padding: 30px 20px;
            }
        }
    </style>
</head>

<body>
    <div class="cv-container">
        <!-- Header Section -->
        <div class="cv-header">
            <img src="{{employee.profileImage}}" alt="Profile Photo" class="profile-img">
            <h1>{{employee.firstName}} {{employee.lastName}}</h1>
            <h2>{{employee.currentDesignation}}</h2>
        </div>

        <!-- Main Content -->
        <div class="cv-content">
            <!-- Biography Section -->
            <div class="section biography">
                <h2>Professional Summary</h2>
                <p>{{employee.biography}}</p>
            </div>

            <!-- Skills Section -->
            <div class="section">
                <h2>Skills & Competencies</h2>
                <div class="skills-container">
                    <!-- Technical Skills -->
                    <div class="skills-section technical-skills">
                        <h3>Technical Skills</h3>
                        {{#each employee.technicalSkills}}
                        <div class="skill-item">
                            <div class="skill-name">
                                <span>{{this.name}}</span>
                                <span>{{this.proficiency}}/10</span>
                            </div>
                            <div class="skill-bar-container">
                                <div class="skill-bar" style="width: {{this.proficiency}}0%;"></div>
                            </div>
                        </div>
                        {{/each}}
                    </div>

                    <!-- English Skills -->
                    <div class="skills-section english-skills">
                        <h3>English Proficiency</h3>
                        <div class="english-skill-item">
                            <span>Speaking</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star empty">★</span>
                            </div>
                        </div>
                        <div class="english-skill-item">
                            <span>Writing</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                            </div>
                        </div>
                        <div class="english-skill-item">
                            <span>Listening</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star empty">★</span>
                                <span class="star empty">★</span>
                            </div>
                        </div>
                        <div class="english-skill-item">
                            <span>Reading</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star empty">★</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Experience Section -->
            <div class="section">
                <h2>Professional Experience</h2>
                <div class="experience-timeline">
                    {{#each employee.experiences}}
                    <div class="timeline-item">
                        <h3>{{this.designation}}</h3>
                        <div class="company">{{this.companyName}}</div>
                        <div class="date-range">{{this.dateRange}}</div>
                    </div>
                    {{/each}}
                </div>
            </div>

            <!-- Projects Section -->
            <div class="section">
                <h2>Key Projects</h2>
                <div class="projects-list">
                    {{#each employee.projects}}
                    <div class="project-item">
                        <h3>{{this.name}}</h3>
                        <div class="project-details">
                            <p><strong class="technologies-used">Technologies Used:</strong> {{this.technologiesUsed}}</p>
                            <p><strong>Technical Responsibility:</strong> {{this.responsibility}}</p>
                            <p><strong>Description:</strong> {{this.description}}</p>
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>

            <!-- Education Section -->
            <div class="section">
                <h2>Education</h2>
                <div class="education-list">
                    {{#each employee.education}}
                    <div class="education-item">
                        <h3>{{this.degree}}</h3>
                        <div class="university">{{this.university}}</div>
                        <div class="details">
                            Department: {{this.department}} | 
                            Graduation Year: {{this.endDate | formatDate 'YYYY'}}
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>
        </div>
    </div>
</body>

</html>`;
