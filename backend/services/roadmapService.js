const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434/api/chat";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL ||
    "llama3.2:latest";

// ==========================================
// Call Ollama
// ==========================================

const callOllama = async (messages, temperature = 0.1) => {
    const response = await fetch(OLLAMA_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
            format: "json",

            options: {
                temperature,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Ollama request failed: ${response.status} ${errorText}`
        );
    }

    const data = await response.json();

    return data.message?.content || "";
};


// ==========================================
// Generate Roadmap
// ==========================================

const generateRoadmap = async ({
    careerGoal,
    missingSkills,
}) => {
    try {
        const skills = Array.isArray(missingSkills)
            ? missingSkills
            : [];

        // ------------------------------------------
        // No missing skills
        // ------------------------------------------

        if (skills.length === 0) {
            return {
                careerGoal: careerGoal || "Not provided",
                roadmap: [],
            };
        }

        // ------------------------------------------
        // Prompt
        // ------------------------------------------

        const prompt = `
You are SkillVerse AI, an expert career learning roadmap generator.

Create a practical learning roadmap for a college student.

CAREER GOAL:
${careerGoal || "Not provided"}

MISSING SKILLS:
${skills.join(", ")}

IMPORTANT RULES:

1. Create roadmap steps ONLY for the missing skills provided above.
2. Do not invent unrelated skills.
3. Start from fundamentals.
4. Progress from Beginner to Intermediate to Advanced where appropriate.
5. Prioritize skills according to their importance for the career goal.
6. Include practical projects.
7. Keep the roadmap realistic for a college student.
8. Avoid repeating the same skill.
9. Each roadmap step must contain:
   - step
   - skill
   - level
   - duration
   - topics
   - project
   - outcome
10. Return ONLY valid JSON.
11. Do NOT return markdown.
12. Do NOT add explanations outside JSON.

Return exactly this JSON structure:

{
    "careerGoal": "${careerGoal || ""}",
    "roadmap": [
        {
            "step": 1,
            "skill": "",
            "level": "Beginner",
            "duration": "",
            "topics": [],
            "project": "",
            "outcome": ""
        }
    ]
}
`;

        // ------------------------------------------
        // Logs
        // ------------------------------------------

        console.log("======================================");
        console.log("🤖 SKILLVERSE OLLAMA ROADMAP");
        console.log("======================================");

        console.log("Ollama Model:", OLLAMA_MODEL);
        console.log("Career Goal:", careerGoal);
        console.log("Missing Skills:", skills);

        // ------------------------------------------
        // Call Ollama
        // ------------------------------------------

        const rawText = await callOllama(
            [
                {
                    role: "system",
                    content:
                        "You are SkillVerse AI. Return only valid JSON. Never return markdown.",
                },

                {
                    role: "user",
                    content: prompt,
                },
            ],
            0.1
        );

        console.log(
            "========== OLLAMA ROADMAP RESPONSE =========="
        );

        console.log(rawText);

        // ------------------------------------------
        // Clean response
        // ------------------------------------------

        let cleaned = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error(
                "Ollama did not return valid roadmap JSON"
            );
        }

        cleaned = cleaned.substring(
            start,
            end + 1
        );

        // ------------------------------------------
        // Parse JSON
        // ------------------------------------------

        let result;

        try {
            result = JSON.parse(cleaned);
        } catch (parseError) {
            console.error(
                "❌ Roadmap JSON Parse Error:",
                parseError.message
            );

            console.error(
                "Invalid Ollama response:",
                cleaned
            );

            throw new Error(
                "Ollama returned invalid roadmap JSON"
            );
        }

        // ------------------------------------------
        // Normalize roadmap
        // ------------------------------------------

        const roadmap = Array.isArray(result.roadmap)
            ? result.roadmap
            : [];

        const normalizedRoadmap = roadmap.map(
            (item, index) => ({
                step:
                    Number(item.step) ||
                    index + 1,

                skill:
                    typeof item.skill === "string"
                        ? item.skill
                        : "Learning Skill",

                level:
                    typeof item.level === "string"
                        ? item.level
                        : "Beginner",

                duration:
                    typeof item.duration === "string"
                        ? item.duration
                        : "",

                topics:
                    Array.isArray(item.topics)
                        ? item.topics.map(
                              (topic) =>
                                  typeof topic ===
                                  "string"
                                      ? topic
                                      : String(topic)
                          )
                        : [],

                project:
                    typeof item.project === "string"
                        ? item.project
                        : "",

                outcome:
                    typeof item.outcome === "string"
                        ? item.outcome
                        : "",
            })
        );

        // ------------------------------------------
        // Safety check
        //
        // Only allow roadmap skills that were
        // actually supplied as missing skills.
        // ------------------------------------------

        const normalize = (value) =>
            String(value || "")
                .toLowerCase()
                .trim();

        const allowedSkills = skills.map(normalize);

        const filteredRoadmap =
            normalizedRoadmap.filter((item) =>
                allowedSkills.includes(
                    normalize(item.skill)
                )
            );

        // ------------------------------------------
        // If Ollama returned no valid roadmap items,
        // create fallback entries.
        // ------------------------------------------

        const finalRoadmap =
            filteredRoadmap.length > 0
                ? filteredRoadmap
                : skills.map((skill, index) => ({
                      step: index + 1,

                      skill,

                      level: "Beginner",

                      duration:
                          "2-4 weeks",

                      topics: [
                          `Introduction to ${skill}`,
                          `Core concepts of ${skill}`,
                          `Practical usage of ${skill}`,
                      ],

                      project:
                          `Build a small practical project using ${skill}.`,

                      outcome:
                          `Understand the fundamentals of ${skill} and use it in a practical project.`,
                  }));

        // ------------------------------------------
        // Final result
        // ------------------------------------------

        const finalResult = {
            careerGoal:
                result.careerGoal ||
                careerGoal ||
                "Not provided",

            roadmap: finalRoadmap,
        };

        console.log(
            "========== FINAL ROADMAP =========="
        );

        console.log(
            JSON.stringify(
                finalResult,
                null,
                2
            )
        );

        return finalResult;

    } catch (error) {
        console.error(
            "❌ Roadmap Ollama Error:",
            error.message
        );

        throw error;
    }
};


// ==========================================
// Export
// ==========================================

module.exports = {
    generateRoadmap,
};