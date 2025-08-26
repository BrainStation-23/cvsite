
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
            line-height: 1.5;
            margin: 0;
            padding: 0;
            color: #333;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }
        /* Never break words across lines/pages */
        body, p, li, h1, h2, h3, h4, .cv-item, .timeline-content, .project-details p {
            hyphens: none;
            word-break: keep-all;      /* keep words intact */
            overflow-wrap: normal;     /* don't insert breaks within words */
            -ms-hyphens: none;
            -moz-hyphens: none;
            -webkit-hyphens: none;
        }

        .main-content p{
            line-height: 15px;
            text-align: justify;
            color: #375471;
        }
        .cv-container {
            display: grid;
            grid-template-columns: 300px 1fr;
            max-width: 794px;
            width: 100%;
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 0 auto;
            padding: 0;
            box-sizing: border-box;
        }

        .sidebar {
            background-color: #3b5669;
            color: white;
            height: 100%;
            padding: 30px 30px;
        }

        .main-content {
            padding: 30px 15px;
            background-color: #ffffff;
            max-width: 495px;
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
            margin-bottom: 10px;
        }

        .sidebar-header h1 {
            font-size: 2.0em;
            margin: 0;
            color: #ecf0f1;
        }

        .sidebar-header h2 {
            font-size: 1.4em;
            margin: 5px 0 0;
            color: #01b0f1;
            font-weight: 400;
        }

        /* CV Section Styling */
        .cv-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
            position: relative;
        }

        .sidebar .cv-section {
            border-bottom: 1px solid #34495e;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .sidebar .cv-section:last-of-type {
            border-bottom: none;
            padding-bottom: 0;
        }

        .cv-section-header {
            page-break-after: avoid;
            page-break-inside: avoid;
            font-weight: bold;
        }

        .sidebar .cv-section-header {
            font-size: 1.4em;
            color: #01b0f1;
            margin-bottom: 10px;
            text-align: left;
        }

        .main-content .cv-section-header {
            color: #01b0f1;
            margin-bottom: 15px;
            font-size: 1.4em;
            font-weight: 500;
        }

        .cv-section-content {
            orphans: 3;
            widows: 3;
            font-size: .8rem;
        }

        /* CV Item Styling */
        .cv-item {
            page-break-inside: avoid;
            margin-bottom: 15px;
            position: relative;
        }

        .sidebar .cv-item {
            margin-bottom: 5px;
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

        .training-header {
            display: inline-block;
        }
        
        .training-title:not(:last-child)::after {
            content: " | ";
            margin-left: 5px; 
            margin-right: 5px;
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
            margin-bottom: 10px !important;
            display: grid;
            grid-template-columns: 120px auto;
            gap: 30px;
            align-items: flex-start;
        }

        .timeline-item:last-child {
            margin-bottom: 0;
        }

        .timeline-date {
            font-weight: bold;
            color: #3e50a5;
            text-align: right;
            padding-top: 4px;
        }

        .timeline-content {
            position: relative;
            padding-left: 35px;
        }

        .timeline-content::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 6px;
            bottom: -56px;
            width: 3px;
            background-color: #58718f;
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
            background-color: #58718f;
            z-index: 1;
        }

        .timeline-content h3 {
            margin: 0 0 5px 0;
            color: #3e50a5;
            font-size: 1.0em;
            font-weight: 600;
            line-height: 1.2;
        }

        .timeline-content p {
            margin: 5px 0 0;
            color: #3e50a5;
            font-size: 0.9em;
            color: #555;
        }

        /* Projects Styling */
        .projects-list {
            counter-reset: project-counter;
        }

        .project-item h2 {
            counter-increment: project-counter;
            margin-bottom: 10px;  
        }

        .project-item h2::before {
            content: counter(project-counter) ". ";
            font-weight: bold;
        }
        .projects-list .project-item{
            margin-bottom: 15px;
        }

        .project-details p {
            margin: 8px 0;
            padding-left: 1.1em;
        }
        /* Allow URLs to wrap so they don't blow up the layout */
        .project-details p a,
        .project-details p[style*="overflow-wrap"] a {
            word-break: break-all;     /* or: overflow-wrap: anywhere; */
            overflow-wrap: anywhere;
        }
        .technologies-used {
            font-style: italic;
            color: #555;
            font-size: 0.9em;
        }
        .project-container .cv-item{
            padding-left: 10px;
        }

        .cv-page-break-before {
        page-break-before: always; /* Forces a page break before this element */
        }
        
        .cv-page-break-after {
        page-break-after: always; /* Forces a page break after this element */
        }
        
        .cv-page-break-avoid {
        page-break-inside: avoid; /* Prevents page breaks inside this element */
        }
        
        .cv-page-break-auto {
        page-break-inside: auto; /* Allows page breaks inside this element */
        }
        
        @page {
        size: A4;
        margin: 18mm 16mm;
        }
        @media print {
        .cv-page-break-before {
        page-break-before: always; /* Forces a page break before this element */
        }
        
        .cv-page-break-after {
        page-break-after: always; /* Forces a page break after this element */
        }
        
        .cv-page-break-avoid {
        page-break-inside: avoid; /* Prevents page breaks inside this element */
        }
        
        .cv-page-break-auto {
        page-break-inside: auto; /* Allows page breaks inside this element */
        }
        .project-item{
                    display: block;
        page-break-inside: avoid;
        }
        .cv-container { display: block; } /* replaces grid during print */
        /* keep items as blocks */
        .projects-list { display: block; }
        .project-item { display: block; break-inside: avoid; page-break-inside: avoid; }
        }



    </style>

    <script>
        (function () {
            // Match your printed page height in CSS pixels.
            // With width ~794px for A4, height is ~1123px at 96dpi.
            const PAGE_HEIGHT = 1123;      // tune if your scale differs
            const PAGE_TOP_MARGIN = 0;     // if you have extra top offsets, add here
            let currentPageBottom = PAGE_HEIGHT;
    
            const items = document.querySelectorAll('.project-item');
            items.forEach((el) => {
                const r = el.getBoundingClientRect();
                // Use pageY offset (scrollY) because getBoundingClientRect is viewport-relative
                const top = r.top + window.scrollY;
                const bottom = r.bottom + window.scrollY;
    
                // If the item would cross the current page bottom, force a break before it
                if (bottom > currentPageBottom) {
                el.classList.add('cv-page-break-before');
                // move the page window
                const itemHeight = r.height;
                currentPageBottom = Math.ceil(top + PAGE_HEIGHT);
                // Safety: if the item itself is taller than a page, let it split (remove class)
                if (itemHeight > PAGE_HEIGHT) {
                    el.classList.remove('cv-page-break-before');
                }
                }
            });
            })();
    </script>


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

            <div class="cv-section cv-page-break-auto" data-section="skills">
                <h3 class="cv-section-header">TECHNICAL SKILLS</h3>
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

            <div class="cv-section cv-page-break-avoid" data-section="education">
                <h3 class="cv-section-header">EDUCATION</h3>
                <div class="cv-section-content">
                    <ul class="cv-item-group">
                        {{#each employee.education}}
                        <li class="cv-item" data-item="education">
                            <div class="cv-item-content">
                                <strong class="cv-item-header">{{this.degree}}</strong><br>
                                {{this.university}}<br>
                                Group: {{this.department}}<br>
                                Passing Year: {{this.endDate}}
                            </div>
                        </li>
                        {{/each}}
                    </ul>
                </div>
            </div>

            <div class="cv-section cv-page-break-avoid" data-section="languages">
                <h3 class="cv-section-header">ENGLISH SKILL</h3>
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

            <div class="cv-section cv-page-break-before profressional-skill-container" data-section="skills">
                <h3 class="cv-section-header">PROFESSIONAL SKILLS</h3>
                <div class="cv-section-content">
                    <ul class="cv-item-group">
                        {{#each employee.specializedSkills}}
                        <li class="cv-item" data-item="skill">
                            <div class="cv-item-content skill-item">
                                <span>{{this.name}} - {{this.proficiency}}/10</span>
                                <div class="skill-bar-container">
                                    <div class="skill-bar" style="width: {{this.proficiency}}0%;"></div>
                                </div>
                            </div>
                        </li>
                        {{/each}}
                    </ul>
                </div>
            </div>

            <div class="cv-section cv-page-break-avoid" data-section="training">
                <h2 class="cv-section-header">Training</h2>
                <div class="cv-section-content">
                    <h3 class="training-header">
                        {{#each employee.trainings}}
                        <span class="training-title">{{this.title}}</span>
                        {{/each}}
                    </h3>
                </div>
            </div>

        </div>

        <div class="main-content">
            <div class="cv-section cv-page-break-avoid" data-section="summary">
                <h2 class="cv-section-header">BIOGRAPHY</h2>
                <div class="cv-section-content">
                    <p>{{employee.biography}}</p>
                </div>
            </div>

            <div class="cv-section cv-page-break-avoid" data-section="experience">
                <h2 class="cv-section-header">EXPERIENCE</h2>
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

            <div class="cv-section project-container" data-section="projects">
                <h2 class="cv-section-header">PROJECTS</h2>
                <div class="cv-section-content">
                    <div class="projects-list cv-item-group">
                        {{#each employee.projects}}
                        <div class="cv-item project-item" data-item="project">
                            <h2 class="cv-section-header">{{this.name}}</h2>
                            <div class="project-details cv-item-content">
                                <p><strong>Technology Used:</strong> {{this.technologiesUsed}}</p>
                                <p><strong>Technical Responsibility:</strong> {{this.responsibility}}</p>
                                <p><strong>Project Duration:</strong> {{this.startDate}} - {{this.endDate}}</p>
                                <p><strong>Short Description:</strong> {{this.description}}</p>
                                <p style="text-align:left; overflow-wrap: break-word;"><strong>Link:</strong> <a href="{{this.url}}" target="_blank">{{this.url}}</a></p>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                </div>
            </div>

            <div class="cv-section cv-page-break-avoid project-container" data-section="projects">
                <h2 class="cv-section-header">ACHIEVEMENTS</h2>
                <div class="cv-section-content">
                    <div class="projects-list cv-item-group">
                        {{#each employee.achievements}}
                        <div class="cv-item" data-item="achievements">
                            <div class="cv-item-content">
                                <p> {{this.title}}</p>
                                <p>{{this.date}}</p>
                                <p>{{this.description}}</p>
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
