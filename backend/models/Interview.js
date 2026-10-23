const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        interviewType: {
            type: String,
            enum: [
                "Technical",
                "HR",
                "Behavioral",
                "Project",
                "Coding",
                "Mixed"
            ],
            default: "Technical"
        },

        careerGoal: {
            type: String,
            default: ""
        },

        questions: [
            {
                question: {
                    type: String,
                    required: true
                },

                answer: {
                    type: String,
                    default: ""
                },

                evaluation: {
                    technicalAccuracy: {
                        type: Number,
                        default: 0
                    },

                    relevance: {
                        type: Number,
                        default: 0
                    },

                    clarity: {
                        type: Number,
                        default: 0
                    },

                    communication: {
                        type: Number,
                        default: 0
                    },

                    completeness: {
                        type: Number,
                        default: 0
                    },

                    overallScore: {
                        type: Number,
                        default: 0
                    },

                    strengths: {
                        type: [String],
                        default: []
                    },

                    improvements: {
                        type: [String],
                        default: []
                    },

                    betterApproach: {
                        type: String,
                        default: ""
                    },

                    feedback: {
                        type: String,
                        default: ""
                    }
                }
            }
        ],

        totalScore: {
            type: Number,
            default: 0
        },

        completed: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Interview",
    interviewSchema
);