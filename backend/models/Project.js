const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        // ==========================================
        // User
        // ==========================================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // ==========================================
        // Project Title
        // ==========================================
        title: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // Project Description
        // ==========================================
        description: {
            type: String,
            default: "",
            trim: true
        },

        // ==========================================
        // Technologies
        // ==========================================
        technologies: {
            type: [String],
            default: []
        },

        // ==========================================
        // GitHub URL
        // ==========================================
        github: {
            type: String,
            default: "",
            trim: true
        },

        // ==========================================
        // Live Demo URL
        // ==========================================
        liveDemo: {
            type: String,
            default: "",
            trim: true
        }
    },

    {
        timestamps: true
    }
);

// ==========================================
// Index
// ==========================================

projectSchema.index({
    user: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Project",
    projectSchema
);