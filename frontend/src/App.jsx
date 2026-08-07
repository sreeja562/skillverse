import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="*" element={<NotFound />} />

                <Route path="/profile" element={<Profile />} />

                
<Route path="/skill-gap" element={<h1>Skill Gap</h1>} />
<Route path="/roadmap" element={<h1>Roadmap</h1>} />
<Route path="/projects" element={<h1>Projects</h1>} />
<Route path="/mentor" element={<h1>AI Mentor</h1>} />
<Route path="/resume" element={<h1>Resume Analyzer</h1>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;