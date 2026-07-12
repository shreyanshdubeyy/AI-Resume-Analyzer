import jsPDF from "jspdf";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { useState, useRef } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const uploadResume = async () => {
    if (!file || !jobDescription) {
      alert("Please upload your resume");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    setLoading(true);

    try {
      const response = await fetch(
  "https://ai-resume-analyzer-4nb9.onrender.com/upload-resume",
  {
    method: "POST",
    body: formData,
  }
);
      

      const data = await response.json();

      const cleanJSON = data.analysis
        .replace("```json", "")
        .replace("```", "")
        .trim();

      setAnalysis(JSON.parse(cleanJSON));

    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }

    setLoading(false);
  };
const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();

  setDragActive(false);

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    setFile(e.dataTransfer.files[0]);
  }
};
const downloadReport = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("AI Resume Analysis Report", 20, 20);

  doc.setFontSize(14);
  doc.text(
    `ATS Match Score: ${analysis["ATS Match Score"]}/100`,
    20,
    40
  );

  doc.save("resume-analysis-report.pdf");
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">

      <div className="max-w-4xl mx-auto">

        
         <div className="text-center mb-10">
  <h1 className="text-5xl font-bold text-white">
    AI Resume Analyzer
  </h1>

  <p className="text-gray-300 mt-3 text-lg">
    Analyze your resume against any job description using AI
  </p>
</div>


        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">

  <div
  onDragEnter={handleDrag}
  onDragOver={handleDrag}
  onDragLeave={handleDrag}
  onDrop={handleDrop}
  onClick={() => fileInputRef.current.click()}
  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
    ${dragActive
      ? "border-blue-500 bg-blue-50"
      : "border-gray-300 bg-gray-50"
    }`}
>
  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf"
    onChange={(e) => setFile(e.target.files[0])}
    className="hidden"
  />

  <div className="text-5xl mb-4">📄</div>

  <p className="text-lg font-semibold">
    Drag & Drop your resume here
  </p>

  <p className="text-gray-500 mt-2">
    or click to browse files
  </p>

  {file && (
    <p className="mt-4 text-green-600 font-medium">
      Selected: {file.name}
    </p>
  )}
</div>

<textarea
  placeholder="Paste Job Description here..."
  value={jobDescription}
  onChange={(e) => setJobDescription(e.target.value)}
  className="border p-3 w-full mt-4 h-40"
/>
          <button
            onClick={uploadResume}
           className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300" 
          >
            {loading ? "🔍 Analyzing Resume..." : "Analyze Resume"}
          </button>

        </div>


        {analysis && (

          <div className="mt-8 space-y-6">


            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-200">

  <h2 className="text-xl font-semibold text-gray-600 uppercase tracking-wider">
    ATS Match Score
  </h2>

  <div className="mt-6">
   <div className="w-40 h-40 mx-auto mt-6">
  <CircularProgressbar
    value={analysis["ATS Match Score"]}
    text={`${analysis["ATS Match Score"]}%`}
  />
</div>
  

  <p className="mt-6 text-gray-600">
    Resume compatibility with the job description
  </p>

</div>
 </div>


            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">

              <h2 className="text-xl font-bold mb-3">
                Skills Found
              </h2>

              <div className="flex flex-wrap gap-2">

                {(analysis["Matching Skills"] || []).map(
                  (skill,index)=>(
                    <span
  key={index}
  className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium shadow-sm hover:scale-105 transition"
>
  {skill}
</span>
                  )
                )}

              </div>

            </div>



            <div className="bg-white rounded-xl shadow p-6">

  <h2 className="text-xl font-bold mb-4">
    Missing Skills
  </h2>

  <div className="flex flex-wrap gap-3">

    {(analysis["Missing Keywords/Skills"] || []).map(
      (skill, index) => (
        <span
          key={index}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-medium shadow-sm hover:scale-105 transition"
        >
          {skill}
        </span>
      )
    )}

  </div>

</div>


            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-bold mb-3">
                Suggestions
              </h2>

              <div className="space-y-3">

  {analysis["Resume Improvement Suggestions"].map(
  (item, index) => (
    <div
      key={index}
      className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
    >
      <span className="font-medium">✓</span> {item}
    </div>
  )
)}

</div>

<div className="text-center mt-8">
  <button
    onClick={downloadReport}
    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition"
  >
    Download PDF Report
  </button>
</div>

            </div>


          </div>

        )}

      </div>

    </div>
  );
}

export default App;