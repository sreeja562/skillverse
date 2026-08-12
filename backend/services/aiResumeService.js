const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

const analyzeResume = async (resumeText) => {
    const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the resume below.

Resume:
${resumeText}

Return ONLY valid JSON.

Do NOT explain anything.
Do NOT write "Here is the analysis".
Do NOT use markdown.
Do NOT wrap the JSON inside \`\`\`.

Return exactly this structure:

{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "recommendedRoles": []
}
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
            max_tokens: 700

        });

        const rawText = response.choices[0].message.content;

        console.log("\n========== AI RAW RESPONSE ==========\n");
        console.log(rawText);

        // Remove markdown if present
        let cleaned = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // Extract JSON
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error("AI did not return JSON.");
        }

        cleaned = cleaned.substring(start, end + 1);

        const analysis = JSON.parse(cleaned);

        return analysis;

    } catch (err) {

        console.error("AI Resume Analysis Error");
        console.error(err);

        throw err;
    }
};

module.exports = {
    analyzeResume
};