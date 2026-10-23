const User = require("../models/User");
const Resume = require("../models/Resume");
const Roadmap = require("../models/Roadmap");

const getDashboard = async (req, res) => {
    try {

        // ==============================
        // Get User
        // ==============================

        const user = await User
            .findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        // ==============================
        // Get Resumes
        // ==============================

        const resumes = await Resume.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });


        const latestResume = resumes[0] || null;


        const scores = resumes.map(
            resume => resume.analysis?.score || 0
        );


        const averageResumeScore =
            scores.length > 0
                ? Math.round(
                    scores.reduce(
                        (sum, score) => sum + score,
                        0
                    ) / scores.length
                )
                : 0;


        const highestResumeScore =
            scores.length > 0
                ? Math.max(...scores)
                : 0;


        // ==============================
        // Get Roadmap
        // ==============================

        const roadmap = await Roadmap.findOne({
            user: req.user.id
        }).sort({
            createdAt: -1
        });


        let roadmapProgress = {
            totalSteps: 0,
            completedSteps: 0,
            remainingSteps: 0,
            progressPercentage: 0
        };


        if (roadmap) {

            const totalSteps =
                roadmap.roadmap.length;

            const completedSteps =
                roadmap.roadmap.filter(
                    step => step.completed
                ).length;

            const remainingSteps =
                totalSteps - completedSteps;

            const progressPercentage =
                totalSteps === 0
                    ? 0
                    : Math.round(
                        (completedSteps / totalSteps) * 100
                    );


            roadmapProgress = {
                totalSteps,
                completedSteps,
                remainingSteps,
                progressPercentage
            };
        }


        // ==============================
        // Dashboard Response
        // ==============================

        return res.status(200).json({

            success: true,

            dashboard: {

                // Student information
                student: {
                    name: user.name,
                    email: user.email,
                    careerGoal:
                        user.careerGoal || "",
                    experienceLevel:
                        user.experienceLevel || "Beginner"
                },


                // Education
                education:
                    user.education || {},


                // Skills
                skills:
                    user.skills || [],


                // Interests
                interests:
                    user.interests || [],


                // Projects
                projects:
                    user.projects || [],


                // Certifications
                certifications:
                    user.certifications || [],


                // Resume information
                resume: {

                    totalResumes:
                        resumes.length,

                    latestScore:
                        latestResume
                            ?.analysis
                            ?.score || 0,

                    averageScore:
                        averageResumeScore,

                    highestScore:
                        highestResumeScore,

                    latestResumeId:
                        latestResume?._id || null
                },


                // Roadmap information
                roadmap: {

                    available:
                        !!roadmap,

                    careerGoal:
                        roadmap?.careerGoal ||
                        user.careerGoal ||
                        "",

                    progress:
                        roadmapProgress,

                    steps:
                        roadmap?.roadmap || []
                }

            }

        });

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });
    }
};


module.exports = {
    getDashboard
};