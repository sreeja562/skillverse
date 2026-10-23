const User = require("../models/User");
const Roadmap = require("../models/Roadmap");

const {
    generateRoadmap
} = require("../services/roadmapService");

// ==========================================
// Generate and Save Roadmap
// ==========================================
const createRoadmap = async (req, res) => {
    try {
        // ------------------------------------------
        // Get logged-in user
        // ------------------------------------------
        const user = await User
            .findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // ------------------------------------------
        // Get missing skills from frontend
        // ------------------------------------------
        let { missingSkills } = req.body;

        if (!Array.isArray(missingSkills)) {
            return res.status(400).json({
                success: false,
                message: "missingSkills must be an array"
            });
        }

        // Remove empty values
        missingSkills = missingSkills
            .filter(skill => skill !== null && skill !== undefined)
            .map(skill => {
                if (typeof skill === "string") {
                    return skill.trim();
                }

                if (typeof skill === "object") {
                    return (
                        skill.skill ||
                        skill.name ||
                        skill.title ||
                        ""
                    ).trim();
                }

                return "";
            })
            .filter(Boolean);

        // Remove duplicate skills
        missingSkills = [...new Set(missingSkills)];

        if (missingSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one missing skill"
            });
        }

        console.log("======================================");
        console.log("ROADMAP GENERATION");
        console.log("Career Goal:", user.careerGoal);
        console.log("Missing Skills:", missingSkills);
        console.log("======================================");

        // ------------------------------------------
        // Generate AI roadmap
        // ------------------------------------------
        const result = await generateRoadmap({
            careerGoal: user.careerGoal,
            missingSkills
        });

        console.log("========== ROADMAP RESULT ==========");
        console.log(JSON.stringify(result, null, 2));

        // ------------------------------------------
        // Validate AI response
        // ------------------------------------------
        if (!result || !Array.isArray(result.roadmap)) {
            return res.status(500).json({
                success: false,
                message: "AI returned an invalid roadmap"
            });
        }

        // ------------------------------------------
        // Normalize roadmap steps
        // ------------------------------------------
        const normalizedRoadmap = result.roadmap
            .map((item, index) => {
                if (!item || typeof item !== "object") {
                    return null;
                }

                return {
                    step:
                        Number(item.step) ||
                        index + 1,

                    skill:
                        typeof item.skill === "string"
                            ? item.skill.trim()
                            : "General Skill",

                    level:
                        typeof item.level === "string"
                            ? item.level
                            : "Beginner",

                    duration:
                        typeof item.duration === "string"
                            ? item.duration
                            : "",

                    topics:
                        Array.isArray(item.topics)
                            ? item.topics
                                .filter(Boolean)
                                .map(topic =>
                                    typeof topic === "string"
                                        ? topic
                                        : String(topic)
                                )
                            : [],

                    project:
                        typeof item.project === "string"
                            ? item.project
                            : "",

                    outcome:
                        typeof item.outcome === "string"
                            ? item.outcome
                            : "",

                    completed: Boolean(item.completed)
                };
            })
            .filter(Boolean);

        // ------------------------------------------
        // Make sure roadmap has steps
        // ------------------------------------------
        if (normalizedRoadmap.length === 0) {
            return res.status(500).json({
                success: false,
                message: "No valid roadmap steps were generated"
            });
        }

        // ------------------------------------------
        // Delete previous roadmap
        // ------------------------------------------
        await Roadmap.deleteMany({
            user: req.user.id
        });

        // ------------------------------------------
        // Save new roadmap
        // ------------------------------------------
        const savedRoadmap = await Roadmap.create({
            user: req.user.id,

            careerGoal:
                result.careerGoal ||
                user.careerGoal ||
                "",

            roadmap: normalizedRoadmap
        });

        console.log("✅ Roadmap saved successfully");

        // ------------------------------------------
        // Send response
        // ------------------------------------------
        return res.status(201).json({
            success: true,
            message: "Roadmap generated and saved successfully",
            roadmap: savedRoadmap
        });

    } catch (error) {
        console.error(
            "❌ Roadmap Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to generate roadmap"
        });
    }
};


// ==========================================
// Get Saved Roadmap
// ==========================================
const getMyRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap
            .findOne({
                user: req.user.id
            })
            .sort({
                createdAt: -1
            });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "No roadmap found"
            });
        }

        return res.status(200).json({
            success: true,
            roadmap
        });

    } catch (error) {
        console.error(
            "❌ Get Roadmap Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get roadmap"
        });
    }
};


// ==========================================
// Update Roadmap Step Completion
// ==========================================
const updateRoadmapProgress = async (req, res) => {
    try {
        const {
            stepId,
            completed
        } = req.body;

        if (!stepId) {
            return res.status(400).json({
                success: false,
                message: "stepId is required"
            });
        }

        const roadmap = await Roadmap.findOne({
            user: req.user.id
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "Roadmap not found"
            });
        }

        // ------------------------------------------
        // Find roadmap step
        // ------------------------------------------
        const step = roadmap.roadmap.id(stepId);

        if (!step) {
            return res.status(404).json({
                success: false,
                message: "Roadmap step not found"
            });
        }

        // ------------------------------------------
        // Update completion
        // ------------------------------------------
        step.completed = Boolean(completed);

        await roadmap.save();

        return res.status(200).json({
            success: true,
            message: "Roadmap progress updated",
            roadmap
        });

    } catch (error) {
        console.error(
            "❌ Roadmap Progress Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update roadmap progress"
        });
    }
};


// ==========================================
// Get Roadmap Progress
// ==========================================
const getRoadmapProgress = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            user: req.user.id
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "Roadmap not found"
            });
        }

        const totalSteps =
            roadmap.roadmap.length;

        const completedSteps =
            roadmap.roadmap.filter(
                step => step.completed === true
            ).length;

        const remainingSteps =
            totalSteps - completedSteps;

        const progressPercentage =
            totalSteps === 0
                ? 0
                : Math.round(
                    (completedSteps / totalSteps) * 100
                );

        return res.status(200).json({
            success: true,

            progress: {
                totalSteps,
                completedSteps,
                remainingSteps,
                progressPercentage
            }
        });

    } catch (error) {
        console.error(
            "❌ Roadmap Progress Analytics Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to get roadmap progress"
        });
    }
};


// ==========================================
// Export
// ==========================================
module.exports = {
    createRoadmap,
    getMyRoadmap,
    updateRoadmapProgress,
    getRoadmapProgress
};