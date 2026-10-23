const mongoose = require("mongoose");

const roadmapStepSchema = new mongoose.Schema(
    {
        step: {
            type: Number,
            required: true
        },

        skill: {
            type: String,
            required: true
        },

        level: {
            type: String,
            default: "Beginner"
        },

        duration: {
            type: String,
            default: ""
        },

        topics: {
            type: [String],
            default: []
        },

        project: {
            type: String,
            default: ""
        },

        outcome: {
            type: String,
            default: ""
        },

        completed: {
            type: Boolean,
            default: false
        }
    }
);

const roadmapSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        careerGoal: {
            type: String,
            default: ""
        },

        roadmap: {
            type: [roadmapStepSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);