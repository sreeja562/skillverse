import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaRoad,
  FaProjectDiagram,
  FaRobot,
  FaFileAlt,
  FaSignOutAlt
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
    { name: "Skill Gap", path: "/skill-gap", icon: <FaChartBar /> },
    { name: "Roadmap", path: "/roadmap", icon: <FaRoad /> },
    { name: "Projects", path: "/projects", icon: <FaProjectDiagram /> },
    { name: "AI Mentor", path: "/mentor", icon: <FaRobot /> },
    { name: "Resume", path: "/resume", icon: <FaFileAlt /> }
  ];

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8 text-center">
        SkillVerse
      </h1>

      <div className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>

      <button
        className="mt-10 w-full flex items-center justify-center gap-2 bg-red-500 p-3 rounded-lg hover:bg-red-600"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
}

export default Sidebar;