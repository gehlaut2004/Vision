import {
  Menu,
  CalendarDays,
  BarChart,
  Radio,
  PieChartIcon,
  BookDashedIcon,
  LayoutDashboard,
} from "lucide-react";

export default function StudentSidebar({
  isOpen,
  toggleSidebar,
  setActivePage,
  activePage,
}) {
  return (
    <div
      className={`bg-gray-800 h-full transition-all duration-300 shadow-lg ${
        isOpen ? "w-60" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-600/30">
        <span
          className={`text-cyan-400 font-bold text-lg ${!isOpen && "hidden"}`}
        >
          Exam Menu
        </span>
        <button
          onClick={toggleSidebar}
          className="text-cyan-400 hover:text-cyan-200"
        >
          <Menu />
        </button>
      </div>

      <div className="flex flex-col gap-2 px-2 py-4">
        <SidebarItem
          icon={<LayoutDashboard/>}
          label="Dashboard"
          onClick={() => setActivePage("dashboard")}
          isActive={activePage === "dashboard"}
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<Radio />}
          label="Live Exams"
          onClick={() => setActivePage("live")}
          isActive={activePage === "live"}
          isOpen={isOpen}
        />
        <SidebarItem
          icon={<CalendarDays />}
          label="Upcoming Exams"
          onClick={() => setActivePage("upcoming")}
          isActive={activePage === "upcoming"}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick, isActive, isOpen }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-cyan-700/30 transition ${
        isActive ? "bg-cyan-700/40 text-cyan-300" : "text-white"
      }`}
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </button>
  );
}
