import React, { useState } from "react";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const AssessmentGenerator: React.FC = () => {
    const [grade, setGrade] = useState(4);
    const [curriculum, setCurriculum] = useState("Ontario");
    const [subject, setSubject] = useState("Math");
    const [difficulty, setDifficulty] = useState("intermediate");
    const [duration, setDuration] = useState(45);
    const [topics, setTopics] = useState("Number Sense, Data Management");
    const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
    const [loading, setLoading] = useState(false);
    const [assessment, setAssessment] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setAssessment("");
        try {
            const prompt = `
                     You are an experienced and certified ${subject} educator, highly familiar with the ${curriculum} curriculum standards and the developmental level of Grade ${grade} students.

                    Your Role:
                    You are responsible for creating a complete classroom-ready assessment specifically designed for Grade ${grade} students. This assessment must reflect a ${difficulty} level of difficulty and be developmentally appropriate for this grade.

                    Task Overview:
                    Design a professional-quality test that:
                    - Aligns with the learning outcomes and expectations of the ${curriculum} curriculum
                    - Is suitable for students in Grade ${grade}
                    - Has a total duration of ${duration} minutes
                    - Focuses on all topics with a particular focus on the following key topics: ${topics}

                    Assessment Format and Structure:
                    Organize the assessment into clear, logically separated sections based on topic or skill level. Each section should:
                    - Contain 3 to 5 questions
                    - Include a variety of question types such as multiple choice, short answer, and problem-solving
                    - Progress in difficulty from easier to more challenging
                    - Use language and instructions that are appropriate for the age group

                    The assessment should include the following elements:
                    1. A title, such as "Grade ${grade} ${subject} Assessment – ${curriculum} Curriculum"
                    2. Student instructions at the beginning of the test
                    3. Section titles and subheadings for organization
                    4. Numbered questions with appropriate formatting
                    5. Indication of marks or points per question if applicable

                    Output Format:
                    Return the assessment in plain text. Do not include any extra commentary or explanation beyond the assessment itself. Ensure the content is well-organized and easy to copy into a document editor.

                    ${includeAnswerKey ? `
                    Answer Key:
                    At the end of the test, include a clearly labeled answer key. List the correct answers for each question using a numbered format that matches the test. For subjective or open-ended questions, provide a model answer or rubric for evaluation.
                    ` : `
                    Do Not Include an Answer Key:
                    Do not include any answers, hints, or solutions in the assessment output.
                    `}

                    Output Constraints:
                    - Only provide the test content
                    - Ensure that all content is clear, accurate, and appropriate for Grade ${grade}
                    - Avoid repeating instructions or adding unnecessary information

                    Now generate the full assessment.
      `;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    }),
                }
            );
            const data = await response.json();
            // DEBUG: Log the full response
            console.log("Gemini API response:", data);

            const text =
                data.candidates?.[0]?.content?.parts?.[0]?.text ||
                data.candidates?.[0]?.content?.parts?.[0]?.text ||
                data.candidates?.[0]?.content?.text ||
                data.candidates?.[0]?.output ||
                data.candidates?.[0]?.text ||
                data.text ||
                "No assessment generated.";

            setAssessment(text);
        } catch (err: any) {
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-50">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-black mb-8 text-center">
                        Assessment Generator
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-semibold text-gray-700">Grade</label>
                            <input type="number" min={1} max={12} value={grade} onChange={e => setGrade(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Curriculum</label>
                            <input type="text" value={curriculum} onChange={e => setCurriculum(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Subject</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Difficulty</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400">
                                <option value="easy">Easy</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Duration (minutes)</label>
                            <input type="number" min={10} max={90} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Topics (comma-separated)</label>
                            <textarea value={topics} onChange={e => setTopics(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                        </div>
                        <div>
                            <label className="inline-flex items-center text-gray-700">
                                <input type="checkbox" checked={includeAnswerKey} onChange={e => setIncludeAnswerKey(e.target.checked)} />
                                <span className="ml-2">Include Answer Key</span>
                            </label>
                        </div>
                        <button type="submit" className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200" disabled={loading}>
                            {loading ? "Generating..." : "Generate Assessment"}
                        </button>
                    </form>
                    {error && <div className="mt-4 text-red-600">{error}</div>}
                    {assessment && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold mb-2 text-gray-800">Generated Assessment</h2>
                            <pre className="bg-black p-4 rounded whitespace-pre-wrap">{assessment}</pre>
                            <a
                                href={`data:text/plain;charset=utf-8,${encodeURIComponent(assessment)}`}
                                download={`Grade${grade}_${subject}_assessment.txt`}
                                className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Download as .txt
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentGenerator;