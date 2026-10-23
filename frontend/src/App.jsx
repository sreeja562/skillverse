import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import SkillGap from "./pages/SkillGap";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Roadmap from "./pages/Roadmap";
import Projects from "./pages/Projects";
import AIMentor from "./pages/AIMentor";
import AIInterviewRoom from "./pages/AIInterviewRoom";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Authentication */}
                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Main pages */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/resume"
                    element={<ResumeAnalyzer />}
                />

                {/* AI Features */}
                <Route
                    path="/skill-gap"
                    element={<SkillGap />}
                />

                <Route
                    path="/roadmap"
                    element={<Roadmap />}
                />

                {/* Projects */}
                <Route
                    path="/projects"
                    element={<Projects />}
                />

                {/* AI Mentor */}
                <Route
                    path="/mentor"
                    element={<AIMentor />}
                />

                {/* AI Mock Interview */}
                <Route
                    path="/mock-interview"
                    element={<AIInterviewRoom />}
                />

                {/* Direct AI Interview URL */}
                <Route
                    path="/ai-interview"
                    element={<AIInterviewRoom />}
                />

                {/* 404 */}
                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;