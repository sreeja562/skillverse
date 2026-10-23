const express = require("express");
const cors = require("cors");

const app = express();

/*
 Middleware
*/

// Read JSON data
app.use(express.json());

// Read Form Data
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

/*
 Routes
*/

// Authentication routes
/*
 Routes
*/

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const projectRoutes = require("./routes/projectRoutes");
const readinessRoutes = require("./routes/readinessRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const mentorRoutes = require("./routes/mentorRoutes");

app.use("/api/mentor", mentorRoutes);
console.log("✅ MENTOR ROUTES REGISTERED");
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/readiness", readinessRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to SkillVerse Backend 🚀"
    });
});

module.exports = app;