const User = require("../models/User");

const getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            success: true,
            dashboard: {
                name: user.name,
                email: user.email,
                skills: user.skills || [],
                projects: user.projects || [],
                careerGoal: user.careerGoal || "Not Set",
                readiness: 0
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getDashboard
};