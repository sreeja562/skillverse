const User = require("../models/User");

// Get Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update Profile
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            education,
            skills,
            interests,
            careerGoal,
            experienceLevel,
            projects,
            certifications
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name !== undefined) user.name = name;
        if (education !== undefined) user.education = education;
        if (skills !== undefined) user.skills = skills;
        if (interests !== undefined) user.interests = interests;
        if (careerGoal !== undefined) user.careerGoal = careerGoal;
        if (experienceLevel !== undefined) {
            user.experienceLevel = experienceLevel;
        }
        if (projects !== undefined) user.projects = projects;
        if (certifications !== undefined) {
            user.certifications = certifications;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                education: user.education,
                skills: user.skills,
                interests: user.interests,
                careerGoal: user.careerGoal,
                experienceLevel: user.experienceLevel,
                projects: user.projects,
                certifications: user.certifications
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};