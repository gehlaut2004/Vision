import { useState } from "react";

export default function QuestionRenderer({ questions, onSubmit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [markedForReview, setMarkedForReview] = useState(
    Array(questions.length).fill(false)
  );
  const [submitted, setSubmitted] = useState(false); // ✅ track if submitted

  const handleOptionSelect = (optionIndex) => {
    if (submitted) return;
    const updated = [...answers];
    updated[currentIndex] = optionIndex;
    setAnswers(updated);
  };

  const handleMarkForReview = () => {
    if (submitted) return;
    const updated = [...markedForReview];
    updated[currentIndex] = !updated[currentIndex];
    setMarkedForReview(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleJumpTo = (index) => {
    setCurrentIndex(index);
  };

  const handleSubmit = () => {
    if (submitted) return;

    if (confirm("Are you sure you want to submit the exam?")) {
      setSubmitted(true); // ✅ lock after submit
      onSubmit(answers);
    }
  };

  const q = questions[currentIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
      {/* 👇 Main Question UI */}
      <div className="bg-gray-800 p-6 rounded-xl border border-cyan-600 space-y-6 font-mono">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-cyan-300">
            Question {currentIndex + 1} / {questions.length}
          </h2>
          {markedForReview[currentIndex] && (
            <span className="text-yellow-400 text-sm">
              ⭐ Marked for Review
            </span>
          )}
        </div>

        <div>
          <p className="text-white mb-4">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q${currentIndex}`}
                  checked={answers[currentIndex] === i}
                  onChange={() => handleOptionSelect(i)}
                  disabled={submitted}
                  className="accent-cyan-400"
                />
                <label className="text-gray-300">{opt}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0 || submitted}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-30"
            >
              ⬅ Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1 || submitted}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-30"
            >
              Next ➡
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleMarkForReview}
              disabled={submitted}
              className={`px-4 py-2 rounded ${
                markedForReview[currentIndex]
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-500/30 text-yellow-300"
              }`}
            >
              {markedForReview[currentIndex] ? "Unmark ⭐" : "Mark for Review"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Submit
            </button>
          </div>
        </div>
      </div>

      {/* 👇 Question Palette */}
      <div className="bg-gray-900 border border-cyan-700 rounded-xl p-4 space-y-4">
        <h3 className="text-cyan-300 font-bold text-lg font-mono">
          Question Palette
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, i) => {
            const isAnswered = answers[i] !== null;
            const isMarked = markedForReview[i];
            const baseStyle =
              "rounded px-2 py-1 text-sm font-mono text-center cursor-pointer";
            let statusStyle = "bg-gray-600 text-white";

            if (isMarked) statusStyle = "bg-yellow-500 text-black font-bold";
            else if (isAnswered) statusStyle = "bg-green-500 text-white";

            return (
              <button
                key={i}
                className={`${baseStyle} ${statusStyle} ${
                  i === currentIndex ? "ring-2 ring-white" : ""
                }`}
                onClick={() => handleJumpTo(i)}
                disabled={submitted}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
