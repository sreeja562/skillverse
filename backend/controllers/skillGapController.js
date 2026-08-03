const User = require("../models/User");

// Career skill requirements
const careerSkills = {
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


const detectSkillGap = async (req, res) => {
    try {

        // Get logged-in student
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const careerGoal = user.careerGoal;

        // Check career
        if (!careerSkills[careerGoal]) {
            return res.status(400).json({
                message: "Career goal not supported yet",
                supportedCareers: Object.keys(careerSkills)
            });
        }

        // Student skills
        const studentSkills = user.skills.map(skill =>
            skill.toLowerCase().trim()
        );

        // Required skills
        const requiredSkills = careerSkills[careerGoal];

        // Find missing skills
        const missingSkills = requiredSkills.filter(skill =>
            !studentSkills.includes(skill.toLowerCase())
        );

        // Find skills already known
        const matchedSkills = requiredSkills.filter(skill =>
            studentSkills.includes(skill.toLowerCase())
        );

        // Calculate readiness
        const readinessScore = Math.round(
            (matchedSkills.length / requiredSkills.length) * 100
        );

        res.status(200).json({
            success: true,

            careerGoal,

            currentSkills: user.skills,

            requiredSkills,

            matchedSkills,

            missingSkills,

            readinessScore,

            message:
                readinessScore >= 80
                    ? "You are highly prepared for this career."
                    : readinessScore >= 50
                    ? "You have a good foundation but need to improve some skills."
                    : "You have significant skill gaps to work on."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Skill gap detection failed"
        });
    }
};


module.exports = {
    detectSkillGap
};