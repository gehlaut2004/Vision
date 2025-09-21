import { useEffect, useState } from "react";
import axios from "axios";

export default function RecentExamsCard() {
  const [exams, setExams] = useState([]);
  const [openExamId, setOpenExamId] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/org/exams/recent", {
          withCredentials: true,
        });
        setExams(response.data);
      } catch (error) {
        console.error("Error fetching recent exams:", error);
      }
    };

    fetchExams();
  }, []);

  const toggleView = (examId) => {
    setOpenExamId(openExamId === examId ? null : examId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <div
          key={exam._id}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {exam.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Date: {new Date(exam.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Attempts: {exam.totalAttempts}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Average Score: {exam.averageScore.toFixed(2)}%
          </p>

          <button
            onClick={() => toggleView(exam._id)}
            className="mt-3 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
          >
            {openExamId === exam._id ? "Close" : "View"}
          </button>

          {openExamId === exam._id && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-left border dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-2 border dark:border-gray-600">
                      Student
                    </th>
                    <th className="px-4 py-2 border dark:border-gray-600">
                      Score
                    </th>
                    <th className="px-4 py-2 border dark:border-gray-600">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exam.attempts.map((attempt) => (
                    <tr
                      key={attempt._id}
                      className={
                        attempt.isCheating ? "bg-red-100 dark:bg-red-900" : ""
                      }
                    >
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {attempt.studentId.name}
                      </td>
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {attempt.score}%
                      </td>
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {new Date(attempt.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {exam.attempts.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        No attempts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
