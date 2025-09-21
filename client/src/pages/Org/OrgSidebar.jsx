import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // For animations

export default function OrgSidebar() {
  return (
    <aside className="bg-gray-600 p-6 w-72 min-h-screen shadow-xl rounded-2xl border-3 border-gray-800">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0 }}
        className="flex items-center gap-3 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="p-3 bg-gray-700 rounded-xl"
        >
          <span className="text-2xl">🧑‍🏫</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-white ">Organization Panel</h2>
      </motion.div>
      <div className="border-b-4 border-gray-800 mb-4"></div>

      <nav className="flex flex-col gap-2 ">
        <SidebarCard icon="🏠" title="Dashboard" to="/org-dashboard" />
        <SidebarCard
          icon="👥"
          title="Add Students"
          to="/org-dashboard/add-students"
        />
        <SidebarCard
          icon="📝"
          title="Manage Exams"
          to="/org-dashboard/manage-exams"
        />
        
        <SidebarCard icon="⚙️" title="Settings" to="/org-dashboard/settings" />
      </nav>
    </aside>
  );
}

function SidebarCard({ icon, title, to }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="group flex items-center gap-4 p-3 rounded-lg transition-all duration-200
                   hover:bg-gray-700 hover:shadow-md
                   border border-transparent hover:border-gray-600"
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors"
        >
          <span className="text-xl">{icon}</span>
        </motion.div>
        <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
          {title}
        </span>
      </Link>
    </motion.div>
  );
}
