const User = require("../models/User");

const projects = [
    {
        title: "AI Resume Analyzer",
        description: "Analyze a student's resume and identify missing skills.",
        skills: ["Python", "LLM", "REST API"],
        difficulty: "Intermediate",
        career: ["AI Platform Engineer", "Full Stack Developer"]
    },
    {
        title: "Student Skill Gap Analyzer",
        description: "Compare student skills with career requirements.",
        skills: ["Python", "Machine Learning", "REST API", "MongoDB"],
        difficulty: "Intermediate",
        career: ["AI Platform Engineer", "Data Scientist"]
    },
    {
        title: "AI Chatbot with RAG",
        description: "Build a chatbot that answers questions using uploaded documents.",
        skills: ["Python", "LLM", "Vector Database", "RAG"],
        difficulty: "Advanced",
        career: ["AI Platform Engineer"]
    },
    {
        title: "Cloud Deployment Platform",
        description: "Deploy a full-stack application using Docker and AWS.",
        skills: ["Docker", "AWS", "REST API", "Git"],
        difficulty: "Advanced",
        career: ["AI Platform Engineer", "Cloud Engineer"]
    },
    {
        title: "Job Recommendation System",
        description: "Recommend suitable jobs based on student skills.",
        skills: ["Python", "Machine Learning", "MongoDB", "REST API"],
        difficulty: "Advanced",
        career: ["Data Scientist", "AI Platform Engineer"]
    },
    {
        title: "Full Stack Task Manager",
        description: "Build a complete task management application.",
        skills: ["React", "Node.js", "Express.js", "MongoDB", "REST API"],
        difficulty: "Beginner",
        career: ["Full Stack Developer"]
    },
    {
        title: "Student Performance Predictor",
        description: "Predict student performance using machine learning.",
        skills: ["Python", "Machine Learning", "Pandas", "Scikit-learn"],
        difficulty: "Intermediate",
        career: ["Data Scientist"]
    }
];


const recommendProjects = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const studentSkills = user.skills.map(skill =>
            skill.toLowerCase().trim()
        );

        const careerGoal = user.careerGoal;

        const recommendations = projects
            .filter(project =>
                project.career.includes(careerGoal)
            )
            .map(project => {

                const matchingSkills = project.skills.filter(skill =>
                    studentSkills.includes(skill.toLowerCase())
                );

                const missingSkills = project.skills.filter(skill =>
                    !studentSkills.includes(skill.toLowerCase())
                );

                return {
                    ...project,
                    matchingSkills,
                    missingSkills,

                    relevanceScore:
                        Math.round(
                            (matchingSkills.length / project.skills.length) * 100
                        )
                };
            })
            .sort((a, b) =>
                b.relevanceScore - a.relevanceScore
            );

        res.status(200).json({
            success: true,
            careerGoal,
            recommendations
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to recommend projects"
        });
    }
};


module.exports = {
    recommendProjects
};