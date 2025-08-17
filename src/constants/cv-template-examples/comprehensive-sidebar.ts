
export const COMPREHENSIVE_SIDEBAR_TEMPLATE = `<!DOCTYPE html>
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
            padding: 0;
            color: #333;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }

        .cv-container {
            display: grid;
            grid-template-columns: 350px 1fr;
            max-width: 1200px;
            width: 100%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 0 auto;
            padding: 0;
            box-sizing: border-box;
        }

        .sidebar {
            background-color: #2c3e50;
            color: white;
            padding: 40px 30px;
        }

        .main-content {
            padding: 2em 2em;
            background-color: #ffffff;
        }

        .profile-img {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 25px;
            border: 5px solid #3498db;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .sidebar-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .sidebar-header h1 {
            font-size: 2.0em;
            margin: 0;
            color: #ecf0f1;
        }

        .sidebar-header h2 {
            font-size: 1.4em;
            margin: 5px 0 0;
            color: #bdc3c7;
            font-weight: 400;
        }

        /* CV Section Styling */
        .cv-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
            position: relative;
        }

        .sidebar .cv-section {
            margin-bottom: 30px;
            border-bottom: 1px solid #34495e;
            padding-bottom: 20px;
        }

        .sidebar .cv-section:last-of-type {
            border-bottom: none;
            padding-bottom: 0;
        }

        .cv-section-header {
            page-break-after: avoid;
            page-break-inside: avoid;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .sidebar .cv-section-header {
            font-size: 1.4em;
            color: #3498db;
            margin-bottom: 15px;
            text-align: left;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }

        .main-content .cv-section-header {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 25px;
            font-size: 2em;
            font-weight: 500;
        }

        .cv-section-content {
            orphans: 3;
            widows: 3;
        }

        /* CV Item Styling */
        .cv-item {
            page-break-inside: avoid;
            margin-bottom: 15px;
            position: relative;
        }

        .sidebar .cv-item {
            margin-bottom: 15px;
        }

        .main-content .cv-item {
            margin-bottom: 30px;
            padding-left: 20px;
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

        /* Sidebar Specific Styling */
        .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .sidebar ul li {
            margin-bottom: 15px;
        }

        /* Technical Skills Styling */
        .skill-item {
            font-size: 1em;
            color: #ecf0f1;
        }

        .skill-bar-container {
            background-color: #34495e;
            height: 12px;
            margin-top: 5px;
        }

        .skill-bar {
            background-color: #FFFFFF;
            height: 100%;
        }

        /* English Skills Star Rating */
        .english-skill-item {
            display: flex;
            margin-bottom: 12px;
            font-size: 1em;
            color: #ecf0f1;
        }

        .skill-name {
            flex: 1;
        }

        .star-rating {
            display: flex;
            gap: 2px;
        }

        .star {
            width: 16px;
            height: 16px;
            color: #f39c12;
            font-size: 16px;
        }

        .star.filled {
            color: #f39c12;
        }

        .star.empty {
            color: #34495e;
        }

        /* Experience Timeline Styling */
        .experience-timeline {
            position: relative;
            padding-left: 0;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 35px;
            display: grid;
            grid-template-columns: 120px auto;
            gap: 30px;
            align-items: flex-start;
        }

        .timeline-item:last-child {
            margin-bottom: 0;
        }

        .timeline-date {
            font-style: italic;
            color: #7f8c8d;
            font-size: 0.95em;
            text-align: right;
            padding-top: 3px;
        }

        .timeline-content {
            position: relative;
            padding-left: 35px;
        }

        .timeline-content::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 6px;
            bottom: -35px;
            width: 3px;
            background-color: #bdc3c7;
        }

        .timeline-item:last-child .timeline-content::before {
            display: none;
        }

        .timeline-content::after {
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background-color: #fff;
            border: 3px solid #3498db;
            z-index: 1;
        }

        .timeline-content h3 {
            margin: 0 0 5px 0;
            color: #2c3e50;
            font-size: 1.0em;
            font-weight: 600;
            line-height: 1.2;
        }

        .timeline-content p {
            margin: 5px 0 0;
            font-size: 0.9em;
            color: #555;
        }

        /* Projects Styling */
        .projects-list {
            counter-reset: project-counter;
        }

        .project-item h3 {
            counter-increment: project-counter;
            margin-bottom: 10px;
            color: #3498db;
        }

        .project-item h3::before {
            content: counter(project-counter) ". ";
            color: #3498db;
            font-weight: bold;
        }

        .project-details p {
            margin: 8px 0;
            padding-left: 1.1em;
        }

        .technologies-used {
            font-style: italic;
            color: #555;
            font-size: 0.9em;
        }

        /* Print-specific styles */
        @media print {
            .cv-container {
                max-width: none;
                margin: 0;
                padding: 15mm;
                box-shadow: none;
                border-radius: 0;
                grid-template-columns: 300px 1fr;
            }
            
            .cv-section {
                margin-bottom: 15px;
            }
            
            .cv-item {
                margin-bottom: 10px;
            }
            
            .sidebar {
                padding: 20px 15px;
            }
            
            .main-content {
                padding: 20px 15px;
            }
        }
    </style>
</head>

<body>
    <div class="cv-container">
        <div class="sidebar">
            <div class="cv-section cv-page-break-avoid" data-section="header">
                <div class="cv-section-content">
                    <img src="{{employee.profileImage}}" alt="Profile Photo" class="profile-img">
                    <div class="sidebar-header">
                        <h1>{{employee.firstName}} {{employee.lastName}}</h1>
                        <h2>{{employee.currentDesignation}}</h2>
                    </div>
                </div>
            </div>

            <div class="cv-section cv-page-break-avoid" data-section="skills">
                <h3 class="cv-section-header">Technical Skills</h3>
                <div class="cv-section-content">
                    <ul class="cv-item-group">
                        {{#each employee.technicalSkills}}
                        <li class="cv-item" data-item="skill">
                            <div class="cv-item-content skill-item">
                                <span>{{this.name}} ({{this.proficiency}}/10)</span>
                                <div class="skill-bar-container">
                                    <div class="skill-bar" style="width: {{this.proficiency}}0%;"></div>
                                </div>
                            </div>
                        </li>
                        {{/each}}
                    </ul>
                </div>
            </div>

            <div class="cv-section cv-page-break-avoid" data-section="languages">
                <h3 class="cv-section-header">English Skills</h3>
                <div class="cv-section-content">
                    <div class="english-skills cv-item-group">
                        <div class="cv-item english-skill-item" data-item="language-skill">
                            <span class="skill-name">Speaking</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star empty">★</span>
                            </div>
                        </div>
                        <div class="cv-item english-skill-item" data-item="language-skill">
                            <span class="skill-name">Writing</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                            </div>
                        </div>
                        <div class="cv-item english-skill-item" data-item="language-skill">
                            <span class="skill-name">Listening</span>
                            <div class="star-rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star empty">★</span>
                                <span class="star empty">★</span>
                            </div>
                        </div>
                        <div class="cv-item english-skill-item" data-item="language-skill">
                            <span class="skill-name">Reading</span>
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

            <div class="cv-section cv-page-break-avoid" data-section="education">
                <h3 class="cv-section-header">Education</h3>
                <div class="cv-section-content">
                    <ul class="cv-item-group">
                        {{#each employee.education}}
                        <li class="cv-item" data-item="education">
                            <div class="cv-item-content">
                                <strong class="cv-item-header">{{this.degree}}</strong><br>
                                {{this.university}}<br>
                                Group: {{this.department}}<br>
                                Passing Year: {{this.endDate | formatDate 'YYYY'}}
                            </div>
                        </li>
                        {{/each}}
                    </ul>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="cv-section cv-page-break-avoid" data-section="summary">
                <h2 class="cv-section-header">Biography</h2>
                <div class="cv-section-content">
                    <p>{{employee.biography}}</p>
                </div>
            </div>

            <div class="cv-section cv-page-break-before" data-section="experience">
                <h2 class="cv-section-header">Experience</h2>
                <div class="cv-section-content">
                    <div class="experience-timeline cv-item-group">
                        {{#each employee.experiences}}
                        <div class="cv-item timeline-item" data-item="experience">
                            <span class="timeline-date">{{this.dateRange}}</span>
                            <div class="timeline-content cv-item-content">
                                <h3 class="cv-item-header">{{this.designation}}</h3>
                                <p>{{this.companyName}}</p>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>

            <div class="cv-section cv-page-break-before" data-section="projects">
                <h2 class="cv-section-header">Projects</h2>
                <div class="cv-section-content">
                    <div class="projects-list cv-item-group">
                        {{#each employee.projects}}
                        <div class="cv-item project-item" data-item="project">
                            <h3 class="cv-item-header">{{this.name}}</h3>
                            <div class="project-details cv-item-content">
                                <p><strong class="technologies-used">Technology Used:</strong> {{this.technologiesUsed}}</p>
                                <p><strong>Technical Responsibility:</strong> {{this.responsibility}}</p>
                                <p><strong>Short Description:</strong> {{this.description}}</p>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>`;
