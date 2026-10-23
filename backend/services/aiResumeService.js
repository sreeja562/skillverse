const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

// =====================================================
// Helper: Safely Convert AI Result
// =====================================================
const normalizeAnalysis = (analysis) => {
    const score = Number(analysis?.score);

    return {
        score: Number.isFinite(score)
            ? Math.max(0, Math.min(100, Math.round(score)))
            : 0,

        strengths: Array.isArray(analysis?.strengths)
            ? analysis.strengths.map(String)
            : [],

        weaknesses: Array.isArray(analysis?.weaknesses)
            ? analysis.weaknesses.map(String)
            : [],

        suggestions: Array.isArray(analysis?.suggestions)
            ? analysis.suggestions.map(String)
            : [],

        recommendedRoles: Array.isArray(
            analysis?.recommendedRoles
        )
            ? analysis.recommendedRoles.map(String)
            : []
    };
};


// =====================================================
// Analyze Resume
// =====================================================
const analyzeResume = async (resumeText) => {
    try {
        // =================================================
        // Validate Resume Text
        // =================================================
        const text = String(resumeText || "").trim();

        if (!text) {
            throw new Error(
                "Resume text is empty."
            );
        }

        // Prevent sending extremely large resumes
        const limitedText = text.slice(0, 12000);

        // =================================================
        // Prompt
        // =================================================
        const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the resume below.

Resume:
${limitedText}

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT explain anything.
3. Do NOT write "Here is the analysis".
4. Do NOT use markdown.
5. Do NOT wrap JSON inside code blocks.
6. Score must be a number between 0 and 100.
7. strengths must be an array of strings.
8. weaknesses must be an array of strings.
9. suggestions must be an array of strings.
10. recommendedRoles must be an array of strings.
11. Do not invent information that is not supported by the resume.

Return exactly this structure:

{
    "score": 0,
    "strengths": [],
    "weaknesses": [],
    "suggestions": [],
    "recommendedRoles": []
}
`;

        // =================================================
        // Hugging Face AI Request
        // =================================================
        const response = await client.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature: 0.1,
            max_tokens: 700
        });

        // =================================================
        // Safely Get AI Response
        // =================================================
        const rawText =
            response?.choices?.[0]?.message?.content || "";

        console.log(
            "\n========== AI RAW RESUME RESPONSE ==========\n"
        );

        console.log(rawText);

        if (!rawText.trim()) {
            throw new Error(
                "AI returned an empty response."
            );
        }

        // =================================================
        // Clean AI Response
        // =================================================
        let cleaned = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        // =================================================
        // Extract JSON
        // =================================================
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error(
                "AI did not return valid JSON."
            );
        }

        cleaned = cleaned.substring(
            start,
            end + 1
        );

        console.log(
            "\n========== CLEANED AI JSON ==========\n"
        );

        console.log(cleaned);

        // =================================================
        // Parse JSON
        // =================================================
        let analysis;

        try {
            analysis = JSON.parse(cleaned);
        } catch (jsonError) {
            console.error(
                "JSON Parse Error:",
                jsonError.message
            );

            throw new Error(
                "AI returned invalid JSON."
            );
        }

        // =================================================
        // Normalize Result
        // =================================================
        const result = normalizeAnalysis(
            analysis
        );

        console.log(
            "\n========== FINAL RESUME ANALYSIS ==========\n"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return result;

    } catch (error) {
        console.error(
            "❌ AI Resume Analysis Error:"
        );

        console.error(
            error.message
        );

        throw error;
    }
};


// =====================================================
// Export
// =====================================================
module.exports = {
    analyzeResume
};