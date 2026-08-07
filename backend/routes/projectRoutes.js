const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getProjects,
    addProject,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

router.get("/", authMiddleware, getProjects);

router.post("/", authMiddleware, addProject);

router.put("/:projectId", authMiddleware, updateProject);

router.delete("/:projectId", authMiddleware, deleteProject);

module.exports = router;