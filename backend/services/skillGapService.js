/*
===========================================================
SKILLVERSE - SKILL GAP SERVICE
===========================================================

AI Provider:
Ollama - Local Llama 3.2

Ollama URL:
http://localhost:11434

The AI is used ONLY for:
1. Resume skill extraction
2. Reasons
3. Priorities
4. Learning steps
5. Duration

The backend itself decides:
- Required skills
- Matching skills
- Missing skills

This makes the actual skill-gap calculation deterministic.
===========================================================
*/


/*
===========================================================
OLLAMA CONFIGURATION
===========================================================
*/

const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434/api/chat";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL ||
    "llama3.2:latest";


/*
===========================================================
CAREER SKILL REQUIREMENTS
===========================================================
*/

const careerRequirements = {

    "web developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Git",
        "REST API"
    ],

    "full stack developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Git",
        "REST API"
    ],

    "mern developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Git",
        "REST API"
    ],

    "frontend developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Git",
        "Responsive Design",
        "REST API"
    ],

    "backend developer": [
        "JavaScript",
        "Node.js",
        "Express.js",
        "MongoDB",
        "SQL",
        "Git",
        "REST API"
    ],

    "python developer": [
        "Python",
        "OOP",
        "SQL",
        "Git",
        "REST API",
        "Django",
        "Flask"
    ],

    "data analyst": [
        "Python",
        "SQL",
        "Excel",
        "Pandas",
        "NumPy",
        "Data Visualization",
        "Statistics",
        "Power BI"
    ],

    "machine learning engineer": [
        "Python",
        "NumPy",
        "Pandas",
        "Scikit-learn",
        "Machine Learning",
        "Statistics",
        "SQL",
        "Git"
    ],

    "software engineer": [
        "Programming",
        "Data Structures",
        "Algorithms",
        "OOP",
        "Git",
        "SQL",
        "Problem Solving"
    ]
};


/*
===========================================================
SKILL NORMALIZATION
===========================================================
*/

const normalizeSkill = (skill) => {

    let value = String(skill || "")
        .trim()
        .toLowerCase();

    value = value
        .replace(/\./g, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ");


    const aliases = {

        "mern": "mern",
        "mern stack": "mern",

        "react": "react",
        "reactjs": "react",
        "react js": "react",

        "node": "nodejs",
        "nodejs": "nodejs",
        "node js": "nodejs",

        "express": "expressjs",
        "expressjs": "expressjs",
        "express js": "expressjs",

        "mongo": "mongodb",
        "mongodb": "mongodb",
        "mongo db": "mongodb",

        "js": "javascript",
        "javascript": "javascript",

        "html5": "html",
        "html": "html",

        "css3": "css",
        "css": "css",

        "datastructures": "data structures",
        "data structures": "data structures",

        "dsa": "data structures",

        "problem solving": "problem solving",

        "rest": "rest api",
        "rest api": "rest api",
        "restful api": "rest api",

        "git": "git",

        "python": "python",

        "sql": "sql",

        "pandas": "pandas",

        "numpy": "numpy",

        "excel": "excel",

        "oop": "oop",
        "oops": "oop",

        "power bi": "power bi",

        "statistics": "statistics",

        "machine learning": "machine learning",

        "scikit learn": "scikit learn",
        "sklearn": "scikit learn",

        "responsive design": "responsive design",

        "programming": "programming",

        "algorithms": "algorithms",

        "java": "java",

        "angular": "angular",

        "django": "django",

        "flask": "flask"
    };


    return aliases[value] || value;
};


/*
===========================================================
NORMALIZE ARRAY
===========================================================
*/

const normalizeSkillArray = (skills) => {

    if (!Array.isArray(skills)) {
        return [];
    }

    const result = [];


    for (const skill of skills) {

        const normalized = normalizeSkill(skill);


        if (
            normalized &&
            !result.some(
                item => normalizeSkill(item) === normalized
            )
        ) {
            result.push(skill);
        }
    }


    return result;
};


/*
===========================================================
FIND CAREER REQUIREMENTS
===========================================================
*/

const getCareerRequirements = (careerGoal) => {

    const goal = String(careerGoal || "")
        .trim()
        .toLowerCase();


    if (careerRequirements[goal]) {
        return careerRequirements[goal];
    }


    /*
    Partial matching
    */

    for (const career of Object.keys(careerRequirements)) {

        if (
            goal.includes(career) ||
            career.includes(goal)
        ) {
            return careerRequirements[career];
        }
    }


    /*
    Generic fallback
    */

    return [
        "HTML",
        "CSS",
        "JavaScript",
        "Git",
        "Problem Solving"
    ];
};


/*
===========================================================
OLLAMA HELPER
===========================================================
*/

const callOllama = async (messages, temperature = 0.1) => {

    try {

        const response = await fetch(
            OLLAMA_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: OLLAMA_MODEL,

                    messages,

                    stream: false,

                    format: "json",

                    options: {
                        temperature
                    }
                })
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Ollama request failed (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        return data.message?.content || "";
    }

    catch (error) {

        console.error(
            "❌ Ollama Error:",
            error.message
        );

        throw error;
    }
};


/*
===========================================================
GET AI PERSONALIZED ANALYSIS
===========================================================

AI is used ONLY for:
1. Reasons
2. Priorities
3. Learning steps
4. Duration

AI does NOT decide missing skills.
===========================================================
*/

const getAIAnalysis = async ({
    careerGoal,
    currentSkills,
    missingSkills
}) => {

    const prompt = `

You are SkillVerse AI, an expert career learning advisor.

Career Goal:
${careerGoal}

Skills the student already has:
${currentSkills.join(", ") || "None"}

Skills that SkillVerse has already identified as missing:
${missingSkills.join(", ") || "None"}

IMPORTANT RULES:

1. Do NOT add new missing skills.
2. Do NOT remove missing skills.
3. Only analyze the missing skills provided above.
4. Do NOT say an existing skill is missing.
5. Do NOT invent technologies.
6. Create practical learning steps.
7. Keep the roadmap realistic for a college student.
8. Prioritize the most important skills.
9. Every roadmap skill MUST come from the provided missing skills.

Return ONLY valid JSON.

Use exactly this structure:

{
    "prioritySkills": [
        "skill name"
    ],
    "roadmap": [
        {
            "skill": "skill name",
            "reason": "short explanation",
            "priority": "High",
            "steps": [
                "step 1",
                "step 2",
                "step 3"
            ],
            "duration": "2-4 weeks"
        }
    ]
}

`;


    try {

        const rawText =
            await callOllama(
                [
                    {
                        role: "system",
                        content:
                            "You are SkillVerse AI. Always return valid JSON only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                0.1
            );


        console.log(
            "========== OLLAMA AI CAREER ANALYSIS =========="
        );

        console.log(rawText);


        let cleaned =
            rawText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();


        const start =
            cleaned.indexOf("{");

        const end =
            cleaned.lastIndexOf("}");


        if (
            start === -1 ||
            end === -1
        ) {

            throw new Error(
                "Ollama did not return valid roadmap JSON"
            );
        }


        cleaned =
            cleaned.substring(
                start,
                end + 1
            );


        return JSON.parse(cleaned);
    }

    catch (error) {

        console.error(
            "❌ AI Career Analysis Error:",
            error.message
        );


        /*
        If AI fails, return a useful fallback.
        */

        return {

            prioritySkills:
                missingSkills.slice(0, 5),

            roadmap:
                missingSkills
                    .slice(0, 5)
                    .map(skill => ({

                        skill,

                        reason:
                            `Develop ${skill} to improve your ${careerGoal} capabilities.`,

                        priority: "High",

                        steps: [
                            `Learn ${skill} fundamentals`,
                            `Practice ${skill} with small projects`,
                            `Build a project using ${skill}`
                        ],

                        duration: "1-2 months"
                    }))
        };
    }
};


/*
===========================================================
MAIN SKILL GAP FUNCTION
===========================================================
*/

const analyzeSkillGap = async ({
    skills,
    careerGoal,
    resumeText
}) => {

    try {

        console.log("======================================");
        console.log("🤖 SKILLVERSE HYBRID SKILL GAP");
        console.log("======================================");

        console.log(
            "Ollama Model:",
            OLLAMA_MODEL
        );

        console.log(
            "Career Goal:",
            careerGoal
        );


        /*
        ---------------------------------------------------
        PROFILE SKILLS
        ---------------------------------------------------
        */

        const profileSkills =
            normalizeSkillArray(skills);


        /*
        ---------------------------------------------------
        RESUME SKILLS
        ---------------------------------------------------
        AI extracts only explicitly mentioned skills.
        ---------------------------------------------------
        */

        const resume =
            String(
                resumeText || ""
            ).slice(0, 10000);


        const extractionPrompt = `

You are a resume skill extraction system.

Extract ONLY technical and professional skills explicitly
mentioned in the resume.

Do NOT invent skills.

Do NOT infer skills.

Only return skills that are actually mentioned.

Resume:

${resume || "No resume available"}

Return ONLY valid JSON using this exact structure:

{
    "skills": [
        "Python",
        "JavaScript",
        "React",
        "MongoDB",
        "SQL"
    ]
}

`;


        let resumeSkills = [];


        try {

            const extractionRaw =
                await callOllama(
                    [
                        {
                            role: "system",
                            content:
                                "You extract skills from resumes. Return valid JSON only."
                        },
                        {
                            role: "user",
                            content:
                                extractionPrompt
                        }
                    ],
                    0
                );


            console.log(
                "========== OLLAMA RESUME SKILLS =========="
            );

            console.log(extractionRaw);


            let cleaned =
                extractionRaw
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();


            const start =
                cleaned.indexOf("{");

            const end =
                cleaned.lastIndexOf("}");


            if (
                start !== -1 &&
                end !== -1
            ) {

                cleaned =
                    cleaned.substring(
                        start,
                        end + 1
                    );


                const parsed =
                    JSON.parse(cleaned);


                if (
                    Array.isArray(
                        parsed.skills
                    )
                ) {
                    resumeSkills =
                        parsed.skills;
                }
            }

        }

        catch (error) {

            console.error(
                "❌ Resume skill extraction failed:",
                error.message
            );

            resumeSkills = [];
        }


        resumeSkills =
            normalizeSkillArray(
                resumeSkills
            );


        /*
        ---------------------------------------------------
        COMBINE STUDENT SKILLS
        ---------------------------------------------------
        */

        const allStudentSkills = [
            ...resumeSkills,
            ...profileSkills
        ];


        /*
        Remove duplicates using normalized names.
        */

        const uniqueStudentSkills = [];


        for (
            const skill of allStudentSkills
        ) {

            const normalized =
                normalizeSkill(skill);


            if (
                normalized &&
                !uniqueStudentSkills.some(
                    existing =>
                        normalizeSkill(existing) ===
                        normalized
                )
            ) {

                uniqueStudentSkills.push(skill);
            }
        }


        /*
        ---------------------------------------------------
        CAREER REQUIREMENTS
        ---------------------------------------------------
        */

        const requiredSkills =
            getCareerRequirements(
                careerGoal
            );


        console.log(
            "Career Requirements:",
            requiredSkills
        );


        /*
        ---------------------------------------------------
        MATCHING SKILLS
        ---------------------------------------------------
        */

        const matchingSkills =
            requiredSkills.filter(
                requiredSkill => {

                    const required =
                        normalizeSkill(
                            requiredSkill
                        );


                    return uniqueStudentSkills.some(
                        studentSkill =>
                            normalizeSkill(
                                studentSkill
                            ) === required
                    );
                }
            );


        /*
        ---------------------------------------------------
        MISSING SKILLS
        ---------------------------------------------------

        THIS IS 100% DETERMINISTIC.

        AI DOES NOT DECIDE THIS.
        ---------------------------------------------------
        */

        const missingSkills =
            requiredSkills.filter(
                requiredSkill => {

                    const required =
                        normalizeSkill(
                            requiredSkill
                        );


                    return !uniqueStudentSkills.some(
                        studentSkill =>
                            normalizeSkill(
                                studentSkill
                            ) === required
                    );
                }
            );


        console.log(
            "========== CALCULATED SKILL GAP =========="
        );

        console.log(
            "Student Skills:",
            uniqueStudentSkills
        );

        console.log(
            "Matching Skills:",
            matchingSkills
        );

        console.log(
            "Missing Skills:",
            missingSkills
        );


        /*
        ---------------------------------------------------
        AI PERSONALIZATION
        ---------------------------------------------------
        */

        const aiResult =
            await getAIAnalysis({

                careerGoal,

                currentSkills:
                    matchingSkills,

                missingSkills
            });


        /*
        ---------------------------------------------------
        VALIDATE AI PRIORITY SKILLS
        ---------------------------------------------------
        */

        const normalizedMissing =
            missingSkills.map(
                normalizeSkill
            );


        let prioritySkills =
            Array.isArray(
                aiResult.prioritySkills
            )
                ? aiResult.prioritySkills.filter(
                    skill =>
                        normalizedMissing.includes(
                            normalizeSkill(skill)
                        )
                )
                : [];


        /*
        If AI doesn't return valid priorities,
        use first 3 missing skills.
        */

        if (
            prioritySkills.length === 0
        ) {

            prioritySkills =
                missingSkills.slice(0, 3);
        }


        /*
        ---------------------------------------------------
        VALIDATE ROADMAP
        ---------------------------------------------------
        */

        let roadmap =
            Array.isArray(
                aiResult.roadmap
            )
                ? aiResult.roadmap.filter(
                    item => {

                        if (!item?.skill) {
                            return false;
                        }


                        return normalizedMissing.includes(
                            normalizeSkill(
                                item.skill
                            )
                        );
                    }
                )
                : [];


        /*
        ---------------------------------------------------
        ENSURE EVERY PRIORITY SKILL HAS ROADMAP
        ---------------------------------------------------
        */

        for (
            const skill of prioritySkills
        ) {

            const exists =
                roadmap.some(
                    item =>
                        normalizeSkill(
                            item.skill
                        ) ===
                        normalizeSkill(
                            skill
                        )
                );


            if (!exists) {

                roadmap.push({

                    skill,

                    reason:
                        `Develop ${skill} to improve your ${careerGoal} capabilities.`,

                    priority: "High",

                    steps: [
                        `Learn ${skill} fundamentals`,
                        `Practice ${skill} with small projects`,
                        `Build a project using ${skill}`
                    ],

                    duration: "1-2 months"
                });
            }
        }


        /*
        ---------------------------------------------------
        FINAL RESULT
        ---------------------------------------------------
        */

        const result = {

            careerGoal:
                careerGoal ||
                "Not provided",

            resumeSkills,

            profileSkills,

            matchingSkills,

            missingSkills,

            prioritySkills,

            roadmap
        };


        console.log(
            "========== FINAL SKILL GAP =========="
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );


        return result;

    }

    catch (error) {

        console.error(
            "❌ Skill Gap Service Error:",
            error.message
        );

        throw error;
    }
};


/*
===========================================================
EXPORT
===========================================================
*/

module.exports = {
    analyzeSkillGap
};