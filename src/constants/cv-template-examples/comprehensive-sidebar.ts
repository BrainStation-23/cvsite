
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

        /* Sidebar Section Styling */
        .sidebar .section {
            margin-bottom: 30px;
            border-bottom: 1px solid #34495e;
            padding-bottom: 20px;
        }

        .sidebar .section:last-of-type {
            border-bottom: none;
            padding-bottom: 0;
        }

        .sidebar h3 {
            font-size: 1.4em;
            color: #3498db;
            margin-bottom: 15px;
            text-align: left;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }

        .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .sidebar ul li {
            margin-bottom: 15px;
        }

        /* New Skill Bar Styling */
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

        /* Main Content Styling */
        .main-content .section {
            margin-bottom: 40px;
        }

        .main-content h2 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 25px;
            font-size: 2em;
            font-weight: 500;
        }

        .main-content .item {
            margin-bottom: 30px;
            padding-left: 20px;
        }

        /* Fixed Vertical Timeline Styling */
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

        /* Timeline date column */
        .timeline-date {
            font-style: italic;
            color: #7f8c8d;
            font-size: 0.95em;
            text-align: right;
            padding-top: 3px;
        }

        /* Timeline content with line and circle */
        .timeline-content {
            position: relative;
            padding-left: 35px;
        }

        /* Vertical line */
        .timeline-content::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 6px;
            bottom: -35px;
            width: 3px;
            background-color: #bdc3c7;
        }

        /* Hide line for last item */
        .timeline-item:last-child .timeline-content::before {
            display: none;
        }

        /* Circle/node */
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
    </style>
</head>

<body>
    <div class="cv-container">
        <div class="sidebar">
            <img src="{{employee.profileImage}}" alt="Profile Photo" class="profile-img">
            <div class="sidebar-header">
                <h1>{{employee.firstName}} {{employee.lastName}}</h1>
                <h2>{{employee.currentDesignation}}</h2>
            </div>

            <div class="section">
                <h3>Technical Skills</h3>
                <ul>
                    {{#each employee.technicalSkills}}
                    <li class="skill-item">
                        <span>{{this.name}} ({{this.proficiency}}/10)</span>
                        <div class="skill-bar-container">
                            <div class="skill-bar" style="width: {{this.proficiency}}0%;"></div>
                        </div>
                    </li>
                    {{/each}}
                </ul>
            </div>

            <div class="section">
                <h3>English Skills</h3>
                <div class="english-skills">
                    <div class="english-skill-item">
                        <span class="skill-name">Speaking</span>
                        <div class="star-rating">
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star empty">★</span>
                        </div>
                    </div>
                    <div class="english-skill-item">
                        <span class="skill-name">Writing</span>
                        <div class="star-rating">
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                        </div>
                    </div>
                    <div class="english-skill-item">
                        <span class="skill-name">Listening</span>
                        <div class="star-rating">
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star empty">★</span>
                            <span class="star empty">★</span>
                        </div>
                    </div>
                    <div class="english-skill-item">
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

            <div class="section">
                <h3>Education</h3>
                <ul>
                    {{#each employee.education}}
                    <li>
                        <strong>{{this.degree}}</strong><br>
                        {{this.university}}<br>
                        Group: {{this.department}}<br>
                        Passing Year: {{this.endDate | formatDate 'YYYY'}}
                    </li>
                    {{/each}}
                </ul>
            </div>
        </div>

        <div class="main-content">
            <div class="section">
                <h2>Biography</h2>
                <p>{{employee.biography}}</p>
            </div>

            <div class="section">
                <h2>Experience</h2>
                <div class="experience-timeline">
                    {{#each employee.experiences}}
                    <div class="timeline-item">
                        <span class="timeline-date">{{this.dateRange}}</span>
                        <div class="timeline-content">
                            <h3>{{this.designation}}</h3>
                            <p>{{this.companyName}}</p>
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>
            <div class="section">
                <h2>Projects</h2>
                <div class="projects-list">
                    {{#each employee.projects}}
                    <div class="project-item">
                        <h3>{{this.name}}</h3>
                        <div class="project-details">
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
</body>

</html>`;
