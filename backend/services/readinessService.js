const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

const calculateReadiness = async ({
    user,
    resume,
    skillGap
}) => {

    const prompt = `
You are SkillVerse AI Placement Readiness Evaluator.

Evaluate this student's placement readiness.

STUDENT PROFILE

Name:
${user.name}

Education:
${JSON.stringify(user.education)}

Skills:
${user.skills?.join(", ") || "None"}

Interests:
${user.interests?.join(", ") || "None"}

Career Goal:
${user.careerGoal || "Not provided"}

Experience Level:
${user.experienceLevel || "Beginner"}

Projects:
${JSON.stringify(user.projects || [])}

Certifications:
${user.certifications?.join(", ") || "None"}

RESUME

Resume Score:
${resume?.analysis?.score || 0}

Resume Strengths:
${JSON.stringify(resume?.analysis?.strengths || [])}

Resume Weaknesses:
${JSON.stringify(resume?.analysis?.weaknesses || [])}

SKILL GAP

${JSON.stringify(skillGap || {})}

Evaluate the student for placements.

Consider:
1. Technical skills
2. Resume quality
3. Projects
4. Career alignment
5. Missing skills
6. Practical experience

Return ONLY valid JSON.

Return exactly:

{
    "overallScore": 0,
    "resumeScore": 0,
    "skillScore": 0,
    "projectScore": 0,
    "careerAlignment": 0,
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
}

All scores must be between 0 and 100.
`;

    try {

        const response = await client.chatCompletion({

            model: "meta-llama/Llama-3.1-8B-Instruct",

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature: 0.2,
            max_tokens: 1000
        });

        const rawText =
            response.choices?.[0]?.message?.content || "";

        console.log(
            "========== READINESS AI RESPONSE =========="
        );

        console.log(rawText);

        let cleaned = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error(
                "AI did not return valid readiness JSON"
            );
        }

        cleaned = cleaned.substring(
            start,
            end + 1
        );

        return JSON.parse(cleaned);

    } catch (error) {

        console.error(
            "Readiness AI Error:",
            error
        );

        throw error;
    }
};

module.exports = {
    calculateReadiness
};