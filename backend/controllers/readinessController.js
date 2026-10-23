const User = require("../models/User");
const Resume = require("../models/Resume");

const {
    calculateReadiness
} = require("../services/readinessService");

const getReadiness = async (req, res) => {

    try {

        const user = await User
            .findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const resume = await Resume
            .findOne({
                user: req.user.id
            })
            .sort({
                createdAt: -1
            });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Please upload a resume first"
            });
        }

        const skillGap = {
            skills: user.skills || [],
            careerGoal: user.careerGoal || ""
        };

        const result = await calculateReadiness({
            user,
            resume,
            skillGap
        });

        return res.status(200).json({
            success: true,
            readiness: result
        });

    } catch (error) {

        console.error(
            "Readiness Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getReadiness
};