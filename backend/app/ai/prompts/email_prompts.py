from langchain_core.prompts import PromptTemplate

COLD_EMAIL_PROMPT = PromptTemplate(
    input_variables=["context", "recipient_name", "company_name", "industry", "pain_points", "job_id", "job_description", "tone"],
    template="""
You are an expert sales and marketing copywriter specializing in high-converting cold emails.
Your goal is to write a personalized cold email based on the provided context, instructions, and job description.

Context about our company and product (from our knowledge base):
{context}

Job Description (for the role they are hiring for):
{job_description}

Recipient Information:
- Name: {recipient_name}
- Company: {company_name}
- Industry: {industry}
- Job ID (if known, otherwise extract from JD): {job_id}
- Known Pain Points: {pain_points}

Instructions:
1. Write a compelling subject line.
2. Tone should be: {tone}.
3. The email must be highly personalized. Use the recipient's name and company.
4. If a Job ID or Job Reference is provided or found in the Job Description, mention it explicitly and naturally (e.g., "I saw you are hiring for Job ID X", or "Regarding job reference Y").
5. Clearly state the value proposition based on the Context provided, showing how our product can solve their pain points or help with this specific job role.
6. Include a clear Call to Action (CTA).
7. Keep it concise, professional, and easy to read.

Output Format:
Subject: [Your Subject Line]

[Body of the email]
"""
)

RESUME_INJECTION_PROMPT = PromptTemplate(
    input_variables=["job_description", "current_resume"],
    template="""
You are an expert technical recruiter and resume writer.
Your task is to extract relevant skills from a Job Description and intelligently integrate them into a candidate's current resume.

Job Description:
{job_description}

Current Resume:
{current_resume}

Instructions:
1. Analyze the Job Description and extract the key skills and keywords.
2. Review the Current Resume.
3. Generate an updated version of the resume that highlights these extracted skills. Do not lie or invent experience, but reframe the existing experience to better align with the job description.
4. Output the updated resume in Markdown format.
"""
)

ATS_ANALYSIS_PROMPT = PromptTemplate(
    input_variables=["resume_content", "job_description"],
    template="""
You are an expert ATS (Applicant Tracking System) analyst and career coach.
Your task is to analyze a candidate's resume against a job description and provide detailed scoring.

Job Description:
{job_description}

Resume:
{resume_content}

Analyze the resume against the job description and return a JSON object with the following fields:
1. "ats_score": A float between 0 and 100 representing the overall ATS compatibility score.
2. "missing_skills": An array of strings listing important skills mentioned in the JD that are missing or insufficiently addressed in the resume.
3. "match_percentage": A float between 0 and 100 representing the percentage of key requirements matched.
4. "recommendations": An array of strings with actionable recommendations to improve the resume for this specific job.
5. "strengths": An array of strings highlighting the strongest matching areas of the resume against the JD.

Return ONLY valid JSON, no other text.
"""
)

QUICK_EMAIL_PROMPT = PromptTemplate(
    input_variables=["role"],
    template="""
You are an expert career coach and cold email writer.
Write a short, crisp, and highly effective cold email applying for a {role} position.
Do not use any placeholders that require the user to look up information.
Keep it under 150 words.
The email should highlight relevant skills, enthusiasm for the role, and a clear call to action.

Output Format:
Subject: [Your Subject Line]

[Body of the email]
"""
)
