const { InferenceClient } = require("@huggingface/inference");
const User = require("../models/User");

const client = new InferenceClient(process.env.HF_TOKEN);

const careerMentor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Please provide a question"
            });
        }

        const prompt = `
You are SkillVerse AI Career Mentor.

Student Profile:
Name: ${user.name}
Education: ${JSON.stringify(user.education)}
Skills: ${user.skills?.join(", ") || "Not provided"}
Interests: ${user.interests?.join(", ") || "Not provided"}
Career Goal: ${user.careerGoal || "Not provided"}
Experience Level: ${user.experienceLevel || "Beginner"}
Projects: ${user.projects?.join(", ") || "None"}
Certifications: ${user.certifications?.join(", ") || "None"}

Student Question:
${question}

Give practical, beginner-friendly career advice.

Consider the student's existing skills and career goal.
Do not give generic advice.
Give specific steps the student can follow.
`;

        const response = await client.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const answer =
            response.choices?.[0]?.message?.content ||
            "Sorry, I could not generate a response.";

        res.status(200).json({
            success: true,
            question,
            answer
        });

    } catch (error) {
        console.error("AI Mentor Error:", error);

        res.status(500).json({
            message: "AI Career Mentor failed",
            error: error.message
        });
    }
};

module.exports = {
    careerMentor
};