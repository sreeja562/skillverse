import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import { getDashboard } from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* =====================================================
            WELCOME SECTION
        ===================================================== */}

        <div>
          <p className="text-purple-600 font-semibold">
            SkillVerse Dashboard
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-1">
            Welcome, {dashboard.name} 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Track your skills, projects, career progress and interview
            preparation in one place.
          </p>
        </div>

        {/* =====================================================
            OVERVIEW CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* PLACEMENT READINESS */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Placement Readiness
                </p>

                <h2 className="text-4xl font-bold text-purple-600 mt-3">
                  {dashboard.readiness}%
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                📊
              </div>
            </div>

            <div className="mt-5">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${Math.min(
                      Math.max(dashboard.readiness || 0, 0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* SKILLS */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Skills
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-3">
                  {dashboard.skills?.length || 0}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                💡
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-5">
              Skills added to your profile
            </p>
          </div>

          {/* PROJECTS */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Projects
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-3">
                  {dashboard.projects?.length || 0}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                🚀
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-5">
              Projects in your portfolio
            </p>
          </div>

          {/* CAREER GOAL */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-medium">
                  Career Goal
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-3 break-words">
                  {dashboard.careerGoal || "Not set"}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0 ml-3">
                🎯
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-5">
              Your current career target
            </p>
          </div>
        </div>

        {/* =====================================================
            AI MOCK INTERVIEW
        ===================================================== */}

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="text-white max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                    🤖
                  </div>

                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      AI-Powered Career Preparation
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold">
                      AI Mock Interview
                    </h2>
                  </div>
                </div>

                <p className="text-purple-100 mt-5 leading-relaxed">
                  Practice real interview questions with your SkillVerse
                  AI interviewer. Choose Technical, HR, Behavioral,
                  Project, Coding or Mixed interviews and receive
                  personalized AI feedback.
                </p>

                <div className="flex flex-wrap gap-3 mt-5">
                  <span className="px-3 py-1.5 bg-white/15 rounded-full text-sm text-white">
                    AI Questions
                  </span>

                  <span className="px-3 py-1.5 bg-white/15 rounded-full text-sm text-white">
                    Answer Evaluation
                  </span>

                  <span className="px-3 py-1.5 bg-white/15 rounded-full text-sm text-white">
                    Instant Feedback
                  </span>

                  <span className="px-3 py-1.5 bg-white/15 rounded-full text-sm text-white">
                    Final Score
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate("/mock-interview")}
                  className="bg-white text-purple-700 px-7 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition shadow-md"
                >
                  Start Mock Interview →
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Continue Your Career Preparation
          </h2>

          <p className="text-gray-500 mt-1">
            Use SkillVerse tools to improve your placement readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* SKILL GAP */}

          <div
            onClick={() => navigate("/skill-gap")}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-xl">
              🧠
            </div>

            <h3 className="font-bold text-lg mt-4">
              Skill Gap Analysis
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Discover the skills you need to reach your career goal.
            </p>

            <p className="text-purple-600 font-semibold text-sm mt-4">
              Analyze Skills →
            </p>
          </div>

          {/* ROADMAP */}

          <div
            onClick={() => navigate("/roadmap")}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
              🗺️
            </div>

            <h3 className="font-bold text-lg mt-4">
              Learning Roadmap
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Follow an AI-generated roadmap to improve your missing
              skills.
            </p>

            <p className="text-blue-600 font-semibold text-sm mt-4">
              View Roadmap →
            </p>
          </div>

          {/* PROJECTS */}

          <div
            onClick={() => navigate("/projects")}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-xl">
              💻
            </div>

            <h3 className="font-bold text-lg mt-4">
              My Projects
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Manage your projects and build a stronger portfolio.
            </p>

            <p className="text-green-600 font-semibold text-sm mt-4">
              View Projects →
            </p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;