import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { FiDownload, FiChevronLeft, FiAlertTriangle, FiCheckCircle, FiUsers, FiBarChart2 } from "react-icons/fi";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function ReportPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | cheated | clean

  const fetchExamReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/org/exams/${id}`);
      setExam(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts =
    exam?.attempts?.filter((a) => {
      if (filter === "cheated") return a.cheated;
      if (filter === "clean") return !a.cheated;
      return true;
    }) || [];

  const downloadCSV = () => {
    const rows = [
      ["Student ID", "Score", "Cheated"],
      ...filteredAttempts.map((a) => [
        a.studentId,
        a.score,
        a.cheated ? "YES" : "NO",
      ]),
    ];
    const csvContent = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exam.title.replace(/\s+/g, "_")}_Filtered_Report.csv`;
    link.click();
  };

  useEffect(() => {
    fetchExamReport();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading report...</p>
      </div>
    </div>
  );

  if (!exam) return (
    <div className="min-h-screen bg-gray-800 p-6 flex items-center justify-center">
      <div className="text-center bg-gray-700 p-8 rounded-lg shadow-lg max-w-md border border-gray-600">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Report Not Found</h2>
        <p className="text-gray-400 mb-4">The requested exam report could not be loaded.</p>
        <Link 
          to="/org-dashboard" 
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-gray-100 rounded-md hover:bg-gray-500 transition-colors"
        >
          <FiChevronLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  const cheatedCount = exam.attempts.filter(a => a.cheated).length;
  const cleanCount = exam.attempts.length - cheatedCount;
  const cheatingPercentage = (cheatedCount / exam.attempts.length) * 100;
  const averageScore = exam.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / (exam.attempts.length || 1);

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Link 
              to="/org-dashboard" 
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-2"
            >
              <FiChevronLeft className="mr-1" />
              Back to Dashboard
            </Link>
            <h2 className="text-3xl font-bold text-gray-100">{exam.title} – Report</h2>
            <div className="flex flex-wrap items-center text-gray-400 mt-2 gap-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(exam.startTime).toLocaleString()}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {exam.duration} minutes
              </span>
              <span className="flex items-center">
                <FiUsers className="mr-1" />
                {exam.attempts.length} attempts
              </span>
              <span className="flex items-center">
                <FiBarChart2 className="mr-1" />
                Avg. score: {averageScore.toFixed(2)}
              </span>
            </div>
          </div>
          
          <button
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 bg-gray-600 text-gray-100 rounded-md hover:bg-gray-500 transition-colors mt-4 md:mt-0"
          >
            <FiDownload className="mr-2" />
            Download CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-700 p-4 rounded-lg shadow-sm mb-6 border border-gray-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Filter by:</span>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                filter === "all" 
                  ? "bg-gray-600 text-gray-100 border border-gray-500" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("cheated")}
              className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                filter === "cheated" 
                  ? "bg-red-900/30 text-red-400 border border-red-800/50" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <FiAlertTriangle className="mr-2" />
              Cheated ({cheatedCount})
            </button>
            <button
              onClick={() => setFilter("clean")}
              className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                filter === "clean" 
                  ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <FiCheckCircle className="mr-2" />
              Clean ({cleanCount})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-300">Total Attempts</h3>
              <FiUsers className="text-blue-400 text-xl" />
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-100">{exam.attempts.length}</p>
          </div>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-300">Cheated</h3>
              <FiAlertTriangle className="text-red-400 text-xl" />
            </div>
            <p className="text-3xl font-bold mt-2 text-red-400">{cheatedCount}</p>
          </div>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-300">Cheating %</h3>
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mt-2 text-purple-400">{cheatingPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-600">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Cheating Distribution</h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: ["Cheated", "Not Cheated"],
                  datasets: [
                    {
                      data: [cheatedCount, cleanCount],
                      backgroundColor: ["#ef4444", "#10b981"],
                      borderColor: ["#7f1d1d", "#065f46"],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#d1d5db',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-600">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Score Distribution</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: exam.attempts.map((_, i) => `Student ${i + 1}`),
                  datasets: [
                    {
                      label: "Score",
                      data: exam.attempts.map((a) => a.score),
                      backgroundColor: "#3b82f6",
                      borderColor: "#1d4ed8",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: '#4b5563',
                      },
                      ticks: {
                        color: '#9ca3af',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#9ca3af',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Attempts Table */}
        <div className="bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-gray-600">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-600">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {filteredAttempts.map((a, idx) => (
                  <tr 
                    key={idx} 
                    className={a.cheated ? "bg-red-900/10 hover:bg-red-900/20" : "hover:bg-gray-600/50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {a.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.score >= 70 ? 'bg-green-900/30 text-green-400' : 
                        a.score >= 50 ? 'bg-yellow-900/30 text-yellow-400' : 
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {a.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {a.cheated ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 flex items-center">
                          <FiAlertTriangle className="mr-1" />
                          Cheated
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 flex items-center">
                          <FiCheckCircle className="mr-1" />
                          Clean
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}