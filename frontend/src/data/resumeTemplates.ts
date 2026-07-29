export interface ResumeTemplate {
  id: string;
  role: string;
  description: string;
  content: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'java-fullstack',
    role: 'Java Full Stack Developer',
    description: 'ATS-friendly resume template optimized for Java backend and modern frontend frameworks.',
    content: `# [Full Name]
[City, State, Zip] | [Phone Number] | [Email Address] | [LinkedIn URL] | [GitHub URL]

## PROFESSIONAL SUMMARY
Results-driven Java Full Stack Developer with X+ years of experience designing, developing, and deploying scalable web applications. Proficient in Java, Spring Boot, microservices architecture, and modern front-end technologies like React/Angular. Strong track record of improving system performance and delivering robust solutions in Agile environments.

## TECHNICAL SKILLS
- **Languages:** Java, JavaScript/TypeScript, SQL, Python, HTML5/CSS3
- **Frameworks & Libraries:** Spring Boot, Spring MVC, Hibernate, React.js, Redux, Node.js
- **Databases:** MySQL, PostgreSQL, MongoDB, Oracle
- **Cloud & DevOps:** AWS, Docker, Kubernetes, Jenkins, Git, Maven
- **Tools & Methodologies:** RESTful APIs, Agile/Scrum, JIRA, Postman, JUnit, Mockito

## PROFESSIONAL EXPERIENCE
**[Current Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – Present**
- Engineered scalable microservices using Spring Boot and deployed them via Docker and Kubernetes, reducing system downtime by 25%.
- Developed dynamic and responsive user interfaces using React.js and Tailwind CSS, increasing user retention by 15%.
- Optimized complex SQL queries and database schemas in PostgreSQL, cutting API response times by 40%.
- Integrated third-party APIs and payment gateways, processing over $1M in transactions securely.
- Mentored junior developers and conducted code reviews to ensure adherence to best practices and coding standards.

**[Previous Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – [Month, Year]**
- Built robust backend services using Java and Hibernate for a high-traffic enterprise application.
- Wrote comprehensive unit and integration tests using JUnit and Mockito, achieving 90%+ test coverage and reducing production bugs.
- Automated CI/CD pipelines using Jenkins, decreasing average deployment time from 2 hours to 20 minutes.

## EDUCATION
**[Degree Name, e.g., B.S. Computer Science]**
[University Name], [City, State] | [Month, Year]`
  },
  {
    id: 'python-fullstack',
    role: 'Python Full Stack Developer',
    description: 'Professional template for Python developers specializing in Django/Flask and modern JS.',
    content: `# [Full Name]
[City, State, Zip] | [Phone Number] | [Email Address] | [LinkedIn URL] | [GitHub URL]

## PROFESSIONAL SUMMARY
Innovative Python Full Stack Developer with X+ years of experience building data-driven web applications and APIs. Expert in Python, Django, Flask, and React. Proven ability to optimize application performance, manage complex databases, and collaborate effectively with cross-functional teams to deliver high-quality software products.

## TECHNICAL SKILLS
- **Languages:** Python, JavaScript, TypeScript, SQL, HTML/CSS
- **Frameworks:** Django, Flask, FastAPI, React.js, Next.js, Vue.js
- **Databases:** PostgreSQL, MySQL, Redis, MongoDB
- **Cloud & Tools:** AWS (EC2, S3, RDS), Docker, Git, GitHub Actions, Nginx, Celery
- **Concepts:** REST APIs, GraphQL, Microservices, CI/CD, Test-Driven Development (TDD)

## PROFESSIONAL EXPERIENCE
**[Current Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – Present**
- Architected and developed a scalable web application using Django REST Framework and React, serving 50,000+ monthly active users.
- Implemented asynchronous task processing with Celery and Redis, improving application performance for heavy data processing tasks by 60%.
- Designed and maintained relational database schemas in PostgreSQL, ensuring data integrity and fast query execution.
- Configured CI/CD pipelines using GitHub Actions to automate testing and deployment to AWS.

**[Previous Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – [Month, Year]**
- Developed RESTful APIs using Flask to support a mobile application, enabling seamless data synchronization.
- Created interactive data visualizations on the frontend using React and D3.js, empowering stakeholders to make data-driven decisions.
- Wrote unit tests using PyTest, ensuring code reliability and preventing regressions.

## EDUCATION
**[Degree Name]**
[University Name], [City, State] | [Month, Year]`
  },
  {
    id: 'data-analyst',
    role: 'Data Analyst',
    description: 'Data-driven template focused on SQL, Python, Tableau/PowerBI, and business impact.',
    content: `# [Full Name]
[City, State, Zip] | [Phone Number] | [Email Address] | [LinkedIn URL] | [Portfolio/GitHub URL]

## PROFESSIONAL SUMMARY
Detail-oriented Data Analyst with X+ years of experience transforming complex datasets into actionable business intelligence. Proficient in SQL, Python, and data visualization tools like Tableau and Power BI. Adept at statistical analysis, predictive modeling, and collaborating with stakeholders to drive strategic decision-making and optimize operations.

## TECHNICAL SKILLS
- **Data Analysis & Modeling:** Statistical Analysis, A/B Testing, Predictive Modeling, Machine Learning basics
- **Programming Languages:** SQL (Advanced), Python (Pandas, NumPy, Scikit-learn), R
- **Data Visualization:** Tableau, Power BI, Matplotlib, Seaborn
- **Databases & Tools:** Snowflake, BigQuery, Excel (Advanced), Jupyter Notebook, Git

## PROFESSIONAL EXPERIENCE
**[Current Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – Present**
- Analyzed large datasets of customer behavior using Python and SQL to identify churn drivers, leading to a 15% reduction in customer churn.
- Developed automated interactive dashboards in Tableau for executive stakeholders, saving the team 10+ hours of manual reporting weekly.
- Conducted A/B testing on marketing campaigns, providing insights that improved conversion rates by 12%.
- Collaborated with data engineers to optimize ETL pipelines, ensuring data accuracy and timeliness for reporting.

**[Previous Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – [Month, Year]**
- Extracted and cleaned data from multiple relational databases using advanced SQL queries to support cross-departmental initiatives.
- Created weekly Excel reports using Pivot Tables and VBA macros to track key performance indicators (KPIs) for the sales team.
- Presented data findings to non-technical stakeholders, translating complex analytical concepts into clear, actionable business strategies.

## EDUCATION
**[Degree Name, e.g., B.S. Statistics/Data Science]**
[University Name], [City, State] | [Month, Year]`
  },
  {
    id: 'frontend-developer',
    role: 'Frontend Developer',
    description: 'Clean, modern resume template highlighting UI/UX, React/Vue, and performance optimization.',
    content: `# [Full Name]
[City, State, Zip] | [Phone Number] | [Email Address] | [LinkedIn URL] | [Portfolio URL]

## PROFESSIONAL SUMMARY
Creative and detail-oriented Frontend Developer with X+ years of experience building responsive, accessible, and performant web applications. Expert in JavaScript, TypeScript, React, and modern CSS frameworks. Passionate about translating UI/UX designs into seamless digital experiences and optimizing application performance.

## TECHNICAL SKILLS
- **Languages:** HTML5, CSS3, JavaScript (ES6+), TypeScript
- **Frameworks & Libraries:** React.js, Next.js, Redux, Vue.js, Tailwind CSS, Material-UI, SASS
- **Testing & Tools:** Jest, React Testing Library, Webpack, Vite, Git, NPM/Yarn
- **Concepts:** Responsive Design, Web Accessibility (WCAG), SPA, SSR, Cross-Browser Compatibility

## PROFESSIONAL EXPERIENCE
**[Current Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – Present**
- Spearheaded the frontend development of a high-traffic SaaS platform using React and TypeScript, resulting in a 40% increase in user engagement.
- Collaborated closely with UI/UX designers to implement responsive, pixel-perfect interfaces, ensuring compliance with WCAG accessibility standards.
- Optimized web vitals and reduced initial load time by 2.5 seconds through code splitting, lazy loading, and asset optimization.
- Migrated legacy CSS to Tailwind CSS, improving code maintainability and standardizing the design system.

**[Previous Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – [Month, Year]**
- Developed reusable UI components in React and documented them using Storybook, accelerating development speed for the entire frontend team by 20%.
- Integrated RESTful APIs and managed global state using Redux Toolkit to provide real-time data updates.
- Wrote comprehensive unit tests using Jest and React Testing Library, ensuring 85% code coverage.

## EDUCATION
**[Degree Name]**
[University Name], [City, State] | [Month, Year]`
  },
  {
    id: 'devops-engineer',
    role: 'DevOps Engineer',
    description: 'Cloud and infrastructure focused template optimized for CI/CD, AWS, and Kubernetes roles.',
    content: `# [Full Name]
[City, State, Zip] | [Phone Number] | [Email Address] | [LinkedIn URL] | [GitHub URL]

## PROFESSIONAL SUMMARY
Dedicated DevOps Engineer with X+ years of experience in automating, scaling, and managing cloud infrastructure. Expert in AWS, Kubernetes, Terraform, and CI/CD pipelines. Proven ability to streamline deployment processes, enhance system reliability, and implement robust security practices to support fast-paced development teams.

## TECHNICAL SKILLS
- **Cloud Platforms:** AWS (EC2, S3, EKS, RDS, VPC), Azure, Google Cloud Platform (GCP)
- **Infrastructure as Code (IaC):** Terraform, CloudFormation, Ansible, Chef
- **Containerization & Orchestration:** Docker, Kubernetes, Helm, ECS
- **CI/CD & Version Control:** Jenkins, GitLab CI, GitHub Actions, Git
- **Monitoring & Scripting:** Prometheus, Grafana, ELK Stack, Python, Bash, Linux Administration

## PROFESSIONAL EXPERIENCE
**[Current Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – Present**
- Designed and implemented a fully automated CI/CD pipeline using GitLab CI and ArgoCD, reducing deployment time from days to minutes.
- Migrated monolithic applications to a microservices architecture on Amazon EKS, improving system scalability and fault tolerance.
- Provisioned and managed cloud infrastructure using Terraform, ensuring consistent and reproducible environments across Dev, Staging, and Prod.
- Implemented comprehensive monitoring and alerting using Prometheus and Grafana, reducing Mean Time to Resolution (MTTR) by 30%.
- Enforced security best practices by implementing IAM roles, security groups, and automated vulnerability scanning in pipelines.

**[Previous Job Title]** | **[Company Name]**, [City, State] | **[Month, Year] – [Month, Year]**
- Managed and optimized AWS infrastructure, achieving a 15% reduction in monthly cloud costs through resource right-sizing and spot instances.
- Automated routine server maintenance and configuration tasks using Ansible and Bash scripts, saving 15 hours of manual work per week.
- Set up centralized logging using the ELK stack (Elasticsearch, Logstash, Kibana) for real-time troubleshooting and log analysis.

## EDUCATION
**[Degree Name]**
[University Name], [City, State] | [Month, Year]

## CERTIFICATIONS
- AWS Certified Solutions Architect – Associate
- Certified Kubernetes Administrator (CKA)`
  }
];
