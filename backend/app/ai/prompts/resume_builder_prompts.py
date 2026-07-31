from langchain_core.prompts import PromptTemplate

RESUME_PARSE_PROMPT = PromptTemplate(
    input_variables=["resume_content"],
    template="""
You are an expert ATS parser. Your task is to extract the following information from the provided resume text:
- Name
- Email (or contact number if email missing)
- Location
- Education (as a single concise string or bullet list)
- Skills (as a list of strings)

Resume Text:
{resume_content}

Return the extracted information ONLY as a valid JSON object with the following exact keys:
{{
  "name": "...",
  "contact": "...",
  "location": "...",
  "education": "...",
  "skills": ["...", "..."]
}}

Do not include any markdown formatting like ```json or any other text. Just the JSON object.
"""
)

ATS_RESUME_BUILD_PROMPT = PromptTemplate(
    input_variables=["parsed_info", "job_description"],
    template="""
You are an expert Resume Writer and ATS optimization specialist.
Your task is to generate a polished, professional, ATS-optimized resume using the provided Candidate Information, tailored specifically to the Job Description below.

Job Description:
{job_description}

Candidate Information (JSON format):
{parsed_info}

Instructions:
1. Output the final resume in formatted Markdown.
2. Ensure 100% ATS compatibility by strategically naturally incorporating keywords from the Job Description into the candidate's skills and experience.
3. If the candidate's information doesn't contain detailed work experience, generate professional, generic but realistic-sounding bullet points based on the skills they have and what the Job Description asks for. Do NOT lie, but frame their existing skills as actionable experience (e.g., "Developed and deployed applications using React..." if they listed React as a skill).
4. Do not include placeholders or brackets (like [Company] or [Date]). Use general terms (e.g., "Previous Employer", "Recent Experience") if specific details are missing.
5. Keep the design clean: use H1 for Name, H3 for Contact Info, H2 for Sections (Skills, Experience, Education).
6. Do NOT wrap the output in markdown code blocks like ```markdown. Just output the raw markdown text.
"""
)
