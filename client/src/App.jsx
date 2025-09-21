import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Auth/Landing.jsx";
import OrgDashboard from "./pages/Org/OrgDashboard";
import AddStudentPage from "./pages/Org/AddStudentPage";
import ManageExamsPage from "./pages/Org/ManageExamsPage.jsx";
import ReportViewer from "./pages/Org/ReportViewer.jsx";
import OrgSettings from "./pages/Org/OrgSettings.jsx";
import StudentDashboard from "./pages/Student/StudentDashboard.jsx";
import StudentExamPage from "./pages/Student/StudentExamPage.jsx"; // ✅ Add this import
import { Toaster } from "react-hot-toast";

// ✅ Protected Routes
import StudentProtectedRoute from "./routes/StudentProtectedRoute.jsx";
import OrgProtectedRoute from "./routes/OrgProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />

        {/* Org Protected Routes */}
        <Route
          path="/org-dashboard"
          element={
            <OrgProtectedRoute>
              <OrgDashboard />
            </OrgProtectedRoute>
          }
        />
        <Route
          path="/org-dashboard/add-students"
          element={
            <OrgProtectedRoute>
              <AddStudentPage />
            </OrgProtectedRoute>
          }
        />
        <Route
          path="/org-dashboard/manage-exams"
          element={
            <OrgProtectedRoute>
              <ManageExamsPage />
            </OrgProtectedRoute>
          }
        />
        <Route
          path="/org-dashboard/settings"
          element={
            <OrgProtectedRoute>
              <OrgSettings />
            </OrgProtectedRoute>
          }
        />
        <Route
          path="/org/report/:id"
          element={
            <OrgProtectedRoute>
              <ReportViewer />
            </OrgProtectedRoute>
          }
        />

        {/* Student Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <StudentProtectedRoute>
              <StudentDashboard />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/student/exam/:examId"
          element={
            <StudentProtectedRoute>
              <StudentExamPage />
            </StudentProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
