import re
import json
from fastapi import FastAPI, UploadFile, File, Form
import fitz
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from typing import Optional

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


app = FastAPI()
class ChatRequest(BaseModel):
    message: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI Resume Analyzer Backend Running"
    }


@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
):

    contents = await file.read()

    pdf = fitz.open(
        stream=contents,
        filetype="pdf"
    )

    text = ""

    for page in pdf:
        text += page.get_text()

    # Extract email
    email_match = re.search(
        r'[\w\.-]+@[\w\.-]+',
        text
    )

    email = email_match.group(0) if email_match else "Not Found"

    # Extract phone number
    phone_match = re.search(
        r'(\+?\d[\d\s-]{9,15})',
        text
    )

    phone = phone_match.group(0) if phone_match else "Not Found"

    # Extract first line as possible name
    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    candidate_name = lines[0] if lines else "Not Found"

    prompt = f"""
You are an expert ATS resume reviewer and technical recruiter.

Analyze the following resume against the given job description.

Candidate Information:
Name: {candidate_name}
Email: {email}
Phone: {phone}

Resume:
{text}

Job Description:
{job_description}

Return ONLY valid JSON with this structure:

Return ONLY valid JSON with this structure:

{{
  "Candidate Name": "",
  "Email": "",
  "Phone": "",
  "ATS Match Score": 0,
  "Resume Summary": "",
  "Matching Skills": [],
  "Missing Keywords/Skills": [],
  "Strengths": [],
  "Weaknesses": [],

"Interview Questions": {{
  "Technical Questions": [],
  "HR Questions": [],
  "Project Questions": []
}},

"Resume Improvement Suggestions": [],
"Recommended Technologies": []

}}

Rules:
- ATS score should be between 0 and 100.
- Resume Summary should be a short professional recruiter-style summary.
- Mention candidate profile, technical skills and overall suitability.
- Evaluate based on skills, projects, experience, and keywords.
- Suggestions should be practical and specific.
- Identify missing skills required for the job.
- Act like a professional recruiter.
- Generate an ATS optimized version of the resume.
- Rewrite the professional summary for the target role.
- Suggest skill additions based on missing keywords.
- Improve project descriptions for ATS optimization.
- Do not invent fake experience or fake projects.
- Only optimize existing content and recommend additions.
- Generate interview questions based on candidate skills, projects and job description.
- Include technical, HR and project-based questions.
- Questions should be relevant for an actual interview.
If no job description is provided:
- Analyze the resume against general industry standards.
- Estimate ATS quality for generic software engineering and AI/ML roles.
- Suggest missing technologies and improvements accordingly.
- Interview Questions field is mandatory.
- Do not remove Interview Questions from JSON.
- Always generate:
  - 5 Technical Questions
  - 3 HR Questions
  - 3 Project Questions
  - Interview Questions must never be empty.
- Generate exactly:
  - 5 Technical Questions
  - 3 HR Questions
  - 3 Project Questions
- Return ONLY valid JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    analysis_json = json.loads(
        response.choices[0].message.content
    )
    if "Interview Questions" not in analysis_json:
        analysis_json["Interview Questions"] = {
        "Technical Questions": [
            "Explain your project architecture.",
            "What machine learning algorithms have you used?",
            "What is overfitting?",
            "Difference between CNN and RNN?",
            "Explain your NLP pipeline."
        ],
        "HR Questions": [
            "Tell me about yourself.",
            "Why should we hire you?",
            "Where do you see yourself in 5 years?"
        ],
        "Project Questions": [
            "What challenges did you face in your project?",
            "What improvements would you make?",
            "What was your role in the project?"
        ]
    }
    

    # Override with extracted values
    analysis_json["Candidate Name"] = candidate_name
    analysis_json["Email"] = email
    analysis_json["Phone"] = phone

    return {
        "filename": file.filename,
        "analysis": analysis_json
    }

@app.get("/test-ai")
def test_ai():
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": "Explain artificial intelligence in one sentence."
                }
            ]
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        return {
            "error": str(e)


            
        }
    
    

class ChatRequest(BaseModel):
    message: str
    analysis: Optional[dict] = {}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """
You are an intelligent AI assistant.

You can help with:
- Programming
- Resume advice
- Career guidance
- Interview preparation
- AI/ML concepts
- Commerce and engineering careers
- General knowledge
"""
                },
                {
                    "role": "user",
                    "content": f"""
Resume Analysis:
{request.analysis}

User Question:
{request.message}

If the question is related to the resume, ATS score, skills,
weaknesses, interview questions or improvements,
use the resume analysis above.

Otherwise answer normally.
"""
                }
            ]
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        return {
            "error": str(e)
        }