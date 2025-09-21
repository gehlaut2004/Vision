import StudentSidebar from "../../components/student/StudentSidebar";
import StudentHeader from "../../components/student/StudentHeader";
import LiveExams from "../../components/student/LiveExams";
import UpcomingExams from "../../components/student/UpcomingExams";
import StudentDashboardHome from "../../components/student/StudentDashboardHome";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studentName, setStudentName] = useState("Student");
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setStudentName(payload.name || "Student");
      } catch {
        setStudentName("Student");
      }
    }
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <StudentDashboardHome />;
      case "live":
        return <LiveExams />;
      case "upcoming":
        return <UpcomingExams />;
      default:
        return <div className="p-4 text-white">404 - Not Found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <StudentSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        setActivePage={setActivePage}
        activePage={activePage}
      />
      <div className="flex-1 flex flex-col">
        <StudentHeader studentName={studentName} />
        <div className="p-6 overflow-y-auto flex-1">{renderPage()}</div>
      </div>
    </div>
  );
}
