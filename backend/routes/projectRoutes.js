const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

// ==========================================
// Create Project
// ==========================================
router.post("/", protect, createProject);

// ==========================================
// Get My Projects
// ==========================================
router.get("/", protect, getMyProjects);

// ==========================================
// Get Project By ID
// ==========================================
router.get("/:id", protect, getProjectById);

// ==========================================
// Update Project
// ==========================================
router.put("/:id", protect, updateProject);

// ==========================================
// Delete Project
// ==========================================
router.delete("/:id", protect, deleteProject);

module.exports = router;