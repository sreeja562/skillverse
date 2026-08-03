const User = require("../models/User");

const careerRequirements = {
    "AI Platform Engineer": [
        "Python",
        "Machine Learning",
        "Deep Learning",
        "LLM",
        "Prompt Engineering",
        "Docker",
        "Kubernetes",
        "AWS",
        "Git",
        "SQL",
        "REST API"
    ],

    "Full Stack Developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "SQL",
        "Git",
        "REST API"
    ],

    "Data Scientist": [
        "Python",
        "SQL",
        "Statistics",
        "Pandas",
        "NumPy",
        "Machine Learning",
        "Data Visualization",
        "Scikit-learn"
    ],

    "Cloud Engineer": [
        "Linux",
        "Networking",
        "AWS",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Git",
        "CI/CD"
    ]
};


const calculateReadiness = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const careerGoal = user.careerGoal;

        if (!careerRequirements[careerGoal]) {
            return res.status(400).json({
                message: "Career goal not supported",
                supportedCareers: Object.keys(careerRequirements)
            });
        }

        // -------------------------
        // 1. SKILL SCORE
        // -------------------------

        const requiredSkills = careerRequirements[careerGoal];

        const studentSkills = user.skills.map(skill =>
            skill.toLowerCase().trim()
        );

        const matchedSkills = requiredSkills.filter(skill =>
            studentSkills.includes(skill.toLowerCase())
        );

        const skillScore = Math.round(
            (matchedSkills.length / requiredSkills.length) * 100
        );


        // -------------------------
        // 2. PROJECT SCORE
        // -------------------------

        const projectCount = user.projects.length;

        let projectScore = 0;

        if (projectCount >= 3) {
            projectScore = 100;
        } else if (projectCount === 2) {
            projectScore = 80;
        } else if (projectCount === 1) {
            projectScore = 60;
        } else {
            projectScore = 0;
        }


        // -------------------------
        // 3. CERTIFICATION SCORE
        // -------------------------

        const certificationCount = user.certifications.length;

        let certificationScore = 0;

        if (certificationCount >= 3) {
            certificationScore = 100;
        } else if (certificationCount === 2) {
            certificationScore = 80;
        } else if (certificationCount === 1) {
            certificationScore = 60;
        } else {
            certificationScore = 20;
        }


        // -------------------------
        // 4. EXPERIENCE SCORE
        // -------------------------

        let experienceScore = 0;

        if (user.experienceLevel === "Advanced") {
            experienceScore = 100;
        } else if (user.experienceLevel === "Intermediate") {
            experienceScore = 70;
        } else {
            experienceScore = 40;
        }


        // -------------------------
        // FINAL SCORE
        // -------------------------

        const readinessScore = Math.round(
            (skillScore * 0.50) +
            (projectScore * 0.25) +
            (certificationScore * 0.10) +
            (experienceScore * 0.15)
        );


        // -------------------------
        // STATUS
        // -------------------------

        let status;

        if (readinessScore >= 80) {
            status = "Placement Ready";
        } else if (readinessScore >= 60) {
            status = "Almost Ready";
        } else if (readinessScore >= 40) {
            status = "Needs Improvement";
        } else {
            status = "Beginner";
        }


        // -------------------------
        // RESPONSE
        // -------------------------

        res.status(200).json({

            success: true,

            careerGoal,

            placementReadiness: readinessScore,

            status,

            breakdown: {
                skills: skillScore,
                projects: projectScore,
                certifications: certificationScore,
                experience: experienceScore
            },

            matchedSkills,

            totalRequiredSkills: requiredSkills.length,

            message:
                readinessScore >= 80
                    ? "You are ready to apply for jobs."
                    : "Keep improving your skills and practical experience."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to calculate placement readiness"
        });
    }
};


module.exports = {
    calculateReadiness
};