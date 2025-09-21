import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function CreateExamCard({ expanded, onToggle }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    duration: "",
    allowTabSwitching: false,
    requireCameraMic: false,
  });

  const [mode, setMode] = useState("manual");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctOption: "" },
  ]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "question") updated[index].question = value;
    else if (field === "correctOption") updated[index].correctOption = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctOption: "" },
    ]);
  };

  const handleCSVChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").filter((r) => r.trim() !== "");
      const parsed = rows.map((row) => row.trim().split(","));

      const formatted = parsed.map((cols) => {
        const [question, opt1, opt2, opt3, opt4, correctOption] = cols;
        return {
          question: question?.trim(),
          options: [opt1?.trim(), opt2?.trim(), opt3?.trim(), opt4?.trim()],
          correctOption: Number(correctOption?.trim()),
        };
      });

      setCsvPreview(formatted);
    };

    reader.readAsText(file);
  };

  const handleStartLive = () => {
  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16); // "YYYY-MM-DDTHH:MM" in local time

  setForm((prev) => ({
    ...prev,
    startDate: localISOTime,
  }));

  setTimeout(() => {
    alert("🎥 Live session started!");
    handleSubmit();
  }, 0);
};


  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.duration) {
      alert("Please fill in required fields.");
      return;
    }

    if (mode === "csv" && !csvFile) {
      alert("Please upload a CSV file.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("orgToken");
      const formData = new FormData();

      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append("startTime", form.startDate);

      if (mode === "manual") {
        const processed = questions.map((q) => {
          const index = q.options.indexOf(q.correctOption);
          return {
            ...q,
            correctOption: index >= 0 ? index : -1,
          };
        });
        formData.append("questions", JSON.stringify(processed));
      } else {
        formData.append("csvFile", csvFile);
      }

      await axios.post("http://localhost:5000/api/org/exams/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Exam created successfully!");
      onToggle();
      setForm({
        title: "",
        description: "",
        startDate: "",
        duration: "",
        allowTabSwitching: false,
        requireCameraMic: false,
      });
      setQuestions([{ question: "", options: ["", "", "", ""], correctOption: "" }]);
      setCsvFile(null);
      setCsvPreview([]);
    } catch (err) {
      console.error("❌ Error creating exam:", err);
      alert("Failed to create exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 text-white transition-all duration-300 hover:ring-2 hover:ring-cyan-500 hover:scale-[1.01] cursor-pointer ${
        expanded ? "col-span-full" : ""
      }`}
      onClick={onToggle}
    >
      <h3 className="text-xl font-bold mb-2">📘 Create New Exam</h3>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="* Exam Title"
              value={form.title}
              onChange={handleFormChange}
              className="bg-gray-800 p-2 rounded"
            />
            <input
              type="text"
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleFormChange}
              className="bg-gray-800 p-2 rounded"
            />
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleFormChange}
              className="bg-gray-800 p-2 rounded"
            />
            <input
              type="number"
              name="duration"
              placeholder="* Duration (min)"
              value={form.duration}
              onChange={handleFormChange}
              className="bg-gray-800 p-2 rounded"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowTabSwitching"
                checked={form.allowTabSwitching}
                onChange={handleFormChange}
              />
              Allow Tab Switching
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requireCameraMic"
                checked={form.requireCameraMic}
                onChange={handleFormChange}
              />
              Require Camera/Mic
            </label>
          </div>

          {/* Mode Switch */}
          <div className="mt-4">
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded ${
                  mode === "manual" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"
                }`}
                onClick={() => setMode("manual")}
              >
                ✍️ Manual Questions
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  mode === "csv" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"
                }`}
                onClick={() => setMode("csv")}
              >
                📄 Upload CSV
              </button>
            </div>

            {mode === "manual" ? (
              <div className="space-y-6 mt-4">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2 border p-4 rounded">
                    <input
                      type="text"
                      placeholder={`Question ${qIdx + 1}`}
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, "question", e.target.value)}
                      className="bg-gray-800 p-2 rounded w-full"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          className="bg-gray-800 p-2 rounded"
                        />
                      ))}
                    </div>
                    <select
                      value={q.correctOption}
                      onChange={(e) =>
                        handleQuestionChange(qIdx, "correctOption", e.target.value)
                      }
                      className="bg-gray-800 p-2 rounded w-full"
                    >
                      <option value="">Select Correct Option</option>
                      {q.options.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button
                  onClick={addQuestion}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
                >
                  ➕ Add Another Question
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVChange}
                  className="bg-gray-800 p-2 rounded"
                />
                <p className="text-sm text-gray-300">
                  📌 Format: <code>question,option1,option2,option3,option4,correctOption</code>
                </p>

                {csvPreview.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded mt-2 space-y-2">
                    <h4 className="font-bold">CSV Preview:</h4>
                    {csvPreview.map((q, idx) => (
                      <div key={idx} className="border p-2 rounded text-sm">
                        <p>
                          <strong>Q{idx + 1}:</strong> {q.question}
                        </p>
                        <ol className="list-decimal ml-5">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={
                                q.correctOption === i + 1 ? "text-green-400 font-semibold" : ""
                              }
                            >
                              {opt}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={handleStartLive}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded"
            >
              🎥 Start Live
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "⏳ Creating..." : "✅ Create Exam"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
