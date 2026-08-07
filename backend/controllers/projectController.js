const User = require("../models/User");

// Get all projects
const getProjects = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            projects: user.projects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add new project
const addProject = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        user.projects.push(req.body);

        await user.save();

        res.status(201).json({
            success: true,
            message: "Project added successfully",
            projects: user.projects
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Project
const updateProject = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const project = user.projects.id(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        project.title = req.body.title;
        project.description = req.body.description;
        project.technologies = req.body.technologies;
        project.github = req.body.github;
        project.liveDemo = req.body.liveDemo;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            projects: user.projects
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Project
const deleteProject = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        user.projects.pull(req.params.projectId);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            projects: user.projects
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getProjects,
    addProject,
    updateProject,
    deleteProject
};