const mongoose = require("mongoose");
const Project = require("../models/Project");

// ==========================================
// Create Project
// ==========================================
const createProject = async (req, res) => {
    try {
        const {
            title,
            description,
            technologies,
            github,
            liveDemo
        } = req.body;

        // Validate title
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Project title is required"
            });
        }

        // Clean technologies
        const cleanTechnologies = Array.isArray(technologies)
            ? technologies
                  .filter(
                      tech =>
                          typeof tech === "string" &&
                          tech.trim()
                  )
                  .map(tech => tech.trim())
            : [];

        const project = await Project.create({
            user: req.user.id,

            title: title.trim(),

            description:
                typeof description === "string"
                    ? description.trim()
                    : "",

            technologies: cleanTechnologies,

            github:
                typeof github === "string"
                    ? github.trim()
                    : "",

            liveDemo:
                typeof liveDemo === "string"
                    ? liveDemo.trim()
                    : ""
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error(
            "Create Project Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create project"
        });
    }
};


// ==========================================
// Get My Projects
// ==========================================
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            projects
        });

    } catch (error) {
        console.error(
            "Get Projects Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get projects"
        });
    }
};


// ==========================================
// Get Project By ID
// ==========================================
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const project = await Project.findOne({
            _id: id,
            user: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        console.error(
            "Get Project Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get project"
        });
    }
};


// ==========================================
// Update Project
// ==========================================
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const {
            title,
            description,
            technologies,
            github,
            liveDemo
        } = req.body;

        const project = await Project.findOne({
            _id: id,
            user: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // -------------------------------
        // Update title
        // -------------------------------
        if (title !== undefined) {
            if (
                typeof title !== "string" ||
                !title.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Project title cannot be empty"
                });
            }

            project.title = title.trim();
        }

        // -------------------------------
        // Update description
        // -------------------------------
        if (description !== undefined) {
            project.description =
                typeof description === "string"
                    ? description.trim()
                    : "";
        }

        // -------------------------------
        // Update technologies
        // -------------------------------
        if (technologies !== undefined) {
            project.technologies =
                Array.isArray(technologies)
                    ? technologies
                          .filter(
                              tech =>
                                  typeof tech === "string" &&
                                  tech.trim()
                          )
                          .map(tech => tech.trim())
                    : [];
        }

        // -------------------------------
        // Update GitHub
        // -------------------------------
        if (github !== undefined) {
            project.github =
                typeof github === "string"
                    ? github.trim()
                    : "";
        }

        // -------------------------------
        // Update Live Demo
        // -------------------------------
        if (liveDemo !== undefined) {
            project.liveDemo =
                typeof liveDemo === "string"
                    ? liveDemo.trim()
                    : "";
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        console.error(
            "Update Project Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update project"
        });
    }
};


// ==========================================
// Delete Project
// ==========================================
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const project =
            await Project.findOneAndDelete({
                _id: id,
                user: req.user.id
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete Project Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete project"
        });
    }
};


// ==========================================
// Export
// ==========================================
module.exports = {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject
};