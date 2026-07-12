
from fastapi import FastAPI, UploadFile, File, Form
import fitz
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
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
    job_description: str = Form(...)
):

    contents = await file.read()

    pdf = fitz.open(
        stream=contents,
        filetype="pdf"
    )

    text = ""

    for page in pdf:
        text += page.get_text()

    prompt = f"""
You are an expert ATS resume reviewer.

Analyze the resume against the job description.

Resume:
{text}

Job Description:
{job_description}

Return JSON format:

1. ATS Match Score out of 100
2. Matching Skills
3. Missing Keywords/Skills
4. Resume Improvement Suggestions

Give the response in JSON format.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    analysis = response.choices[0].message.content

    return {
        "filename": file.filename,
        "analysis": analysis
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