const { InferenceClient } = require("@huggingface/inference");
const User = require("../models/User");

const client = new InferenceClient(process.env.HF_TOKEN);

const analyzeResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({
                message: "Please provide resume text"
            });
        }

        const prompt = `
You are SkillVerse AI Resume Analyzer.

Analyze this student's resume according to their target career.

Student Profile:
Name: ${user.name || "Not provided"}
Education: ${JSON.stringify(user.education) || "Not provided"}
Current Skills: ${user.skills?.join(", ") || "Not provided"}
Career Goal: ${user.careerGoal || "Not provided"}
Experience Level: ${user.experienceLevel || "Beginner"}
Projects: ${user.projects?.join(", ") || "None"}
Certifications: ${user.certifications?.join(", ") || "None"}

RESUME:
${resumeText}

Analyze the resume and provide:

1. Resume Score: Give a score from 0-100.

2. Strengths:
List the strongest parts of the resume.

3. Weaknesses:
List areas that need improvement.

4. Missing Skills:
Identify important skills missing for the student's target career.

5. Project Suggestions:
Suggest projects that would strengthen the resume.

6. Improvement Suggestions:
Give specific improvements to the resume.

7. Career Recommendation:
Explain how well the resume matches the student's target career.

Keep the response practical and suitable for a college student/fresher.
Do not give generic advice.
`;

        const response = await client.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            max_tokens: 700,
            temperature: 0.7
        });

        const analysis =
            response.choices?.[0]?.message?.content ||
            "Sorry, I could not analyze the resume.";

        res.status(200).json({
            success: true,
            careerGoal: user.careerGoal,
            analysis
        });

    } catch (error) {

        console.error("Resume Analyzer Error:", error);

        res.status(500).json({
            message: "Resume analysis failed",
            error: error.message
        });
    }
};

module.exports = {
    analyzeResume
};