// =========================================================
// SKILLVERSE AI INTERVIEW SERVICE
// Ollama Local AI
// =========================================================

const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434/api/chat";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL ||
    "llama3.2:latest";

// =========================================================
// OLLAMA HELPER
// =========================================================

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

// =========================================================
// HELPERS
// =========================================================

const cleanText = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
};

const normalizeArray = (value) => {
    return Array.isArray(value) ? value : [];
};

// =========================================================
// ANSWER QUALITY PRE-CHECK
// =========================================================
//
// This is extremely important.
//
// We do NOT send obvious nonsense answers to Ollama.
//
// Examples:
// "andhfgbncnbj"
// "asdfghjkl"
// "qwertyuiop"
// "123456"
// "I don't know"
// "" 
//
// These should not receive a normal interview score.
// =========================================================

const analyzeAnswerBasicQuality = (answer) => {
    const text = cleanText(answer);

    if (!text) {
        return {
            valid: false,
            reason: "empty",
        };
    }

    const lower = text.toLowerCase();

    // -----------------------------------------------------
    // Very common non-answers
    // -----------------------------------------------------

    const nonAnswers = [
        "i don't know",
        "i dont know",
        "dont know",
        "don't know",
        "no idea",
        "not sure",
        "idk",
        "nothing",
        "skip",
        "pass",
        "i cannot answer",
        "i can't answer",
    ];

    if (nonAnswers.includes(lower)) {
        return {
            valid: false,
            reason: "non_answer",
        };
    }

    // -----------------------------------------------------
    // Very short answers
    // -----------------------------------------------------

    const words = text
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1 && text.length < 5) {
        return {
            valid: false,
            reason: "too_short",
        };
    }

    // -----------------------------------------------------
    // Detect strings with almost no alphabetic content
    // -----------------------------------------------------

    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const numbers = (text.match(/[0-9]/g) || []).length;

    if (letters === 0) {
        return {
            valid: false,
            reason: "no_words",
        };
    }

    // If the answer is mostly numbers/symbols
    if (
        text.length >= 5 &&
        numbers > letters
    ) {
        return {
            valid: false,
            reason: "invalid_content",
        };
    }

    // -----------------------------------------------------
    // Detect obvious keyboard/random strings
    // -----------------------------------------------------

    const randomPatterns = [
        /^asdf+$/i,
        /^asdfgh+$/i,
        /^asdfghjkl+$/i,
        /^qwerty+$/i,
        /^qwertyuiop+$/i,
        /^zxcvbn+$/i,
        /^poiuy+$/i,
        /^lkjhg+$/i,
        /^mnbvc+$/i,
        /^[a-z]{1,3}$/i,
    ];

    if (
        randomPatterns.some((pattern) =>
            pattern.test(lower.replace(/\s/g, ""))
        )
    ) {
        return {
            valid: false,
            reason: "random_text",
        };
    }

    // -----------------------------------------------------
    // Detect suspicious single-token strings
    // -----------------------------------------------------

    if (
        words.length === 1 &&
        text.length >= 8 &&
        !/[aeiou]/i.test(text)
    ) {
        return {
            valid: false,
            reason: "random_text",
        };
    }

    // -----------------------------------------------------
    // Repeated character detection
    // -----------------------------------------------------

    if (/(.)\1{4,}/i.test(text)) {
        return {
            valid: false,
            reason: "repeated_characters",
        };
    }

    // -----------------------------------------------------
    // Extremely low linguistic quality
    //
    // If a long answer contains almost no spaces,
    // it is suspicious.
    // -----------------------------------------------------

    if (
        text.length > 15 &&
        words.length === 1 &&
        !/[.!?]/.test(text)
    ) {
        return {
            valid: false,
            reason: "single_random_word",
        };
    }

    return {
        valid: true,
        reason: "valid",
    };
};

// =========================================================
// INVALID ANSWER EVALUATION
// =========================================================

const createInvalidAnswerEvaluation = (reason) => {
    let feedback =
        "The answer does not provide a meaningful response to the interview question.";

    let improvements = [
        "Read the question carefully.",
        "Provide a relevant answer instead of random or incomplete text.",
        "Explain your answer clearly using appropriate examples or concepts.",
    ];

    if (reason === "empty") {
        feedback =
            "No answer was provided.";
    }

    if (reason === "non_answer") {
        feedback =
            "The response indicates that the question was not answered.";
    }

    if (reason === "too_short") {
        feedback =
            "The answer is too short to demonstrate understanding of the question.";
    }

    if (reason === "random_text") {
        feedback =
            "The answer appears to be random or meaningless text and does not address the interview question.";
    }

    if (reason === "no_words") {
        feedback =
            "The response does not contain meaningful words.";
    }

    if (reason === "invalid_content") {
        feedback =
            "The response does not contain enough meaningful information to evaluate.";
    }

    if (reason === "repeated_characters") {
        feedback =
            "The response contains repeated characters rather than a meaningful interview answer.";
    }

    if (reason === "single_random_word") {
        feedback =
            "The response appears to be an isolated or meaningless word rather than an answer to the question.";
    }

    return {
        technicalAccuracy: 0,
        relevance: 0,
        clarity: 0,
        communication: 0,
        completeness: 0,
        overallScore: 0,
        strengths: [],
        improvements,
        betterApproach:
            "Provide a direct answer to the question, explain the main concept, and include an example when appropriate.",
        feedback,
    };
};

// =========================================================
// GENERATE INTERVIEW QUESTION
// =========================================================

const generateInterviewQuestion = async ({
    profile = {},
    skillGap = {},
    projects = [],
    interviewType = "Technical",
    questionNumber = 1,
    previousQuestions = [],
}) => {
    try {
        const careerGoal =
            profile.careerGoal ||
            skillGap.careerGoal ||
            "General Software Developer";

        const experienceLevel =
            profile.experienceLevel ||
            "Beginner";

        const skills =
            normalizeArray(profile.skills);

        const missingSkills =
            normalizeArray(skillGap.missingSkills);

        const prioritySkills =
            normalizeArray(skillGap.prioritySkills);

        // -------------------------------------------------
        // PROJECTS
        // -------------------------------------------------

        const projectText =
            projects.length > 0
                ? projects
                      .map((project, index) => {
                          if (
                              typeof project ===
                              "string"
                          ) {
                              return `${index + 1}. ${project}`;
                          }

                          return `${index + 1}. ${
                              project.title ||
                              project.name ||
                              "Untitled Project"
                          }`;
                      })
                      .join("\n")
                : "No projects available";

        // -------------------------------------------------
        // PREVIOUS QUESTIONS
        // -------------------------------------------------

        const previousQuestionText =
            previousQuestions.length > 0
                ? previousQuestions
                      .map(
                          (question, index) =>
                              `${index + 1}. ${question}`
                      )
                      .join("\n")
                : "No previous questions";

        // -------------------------------------------------
        // PROMPT
        // -------------------------------------------------

        const prompt = `
You are SkillVerse AI Mock Interviewer.

You are conducting a realistic placement interview for a college student.

INTERVIEW INFORMATION

Interview Type:
${interviewType}

Question Number:
${questionNumber}

Experience Level:
${experienceLevel}

Career Goal:
${careerGoal}

Student Skills:
${skills.join(", ") || "None"}

Missing Skills:
${missingSkills.join(", ") || "None"}

Priority Skills:
${prioritySkills.join(", ") || "None"}

Projects:
${projectText}

Previous Questions:
${previousQuestionText}

QUESTION GENERATION RULES

1. Ask exactly ONE interview question.
2. The question must be relevant to the student's career goal, skills, projects, or missing skills.
3. Do not claim the student knows a technology unless it appears in the provided information.
4. Do not repeat previous questions.
5. For Technical interviews, ask technical questions appropriate for the student's experience level.
6. For HR interviews, ask realistic placement HR questions.
7. For Behavioral interviews, ask questions about teamwork, challenges, leadership, communication, and problem solving.
8. For Project interviews, ask about the student's actual projects.
9. For Coding interviews, ask one coding or problem-solving question.
10. Start with easier questions and gradually increase difficulty.
11. Keep the question concise.
12. Do not provide the answer.
13. Do not ask multiple questions.
14. Do not include numbering.
15. Do not include explanations.
16. Return ONLY the interview question.

Return only the question.
`;

        console.log(
            "======================================"
        );

        console.log(
            "🤖 SKILLVERSE OLLAMA INTERVIEW"
        );

        console.log(
            "======================================"
        );

        console.log(
            "Ollama Model:",
            OLLAMA_MODEL
        );

        console.log(
            "Interview Type:",
            interviewType
        );

        console.log(
            "Question Number:",
            questionNumber
        );

        console.log(
            "Career Goal:",
            careerGoal
        );

        const question =
            await callOllama(
                [
                    {
                        role: "system",
                        content:
                            "You are a professional AI placement interviewer. Ask exactly one question at a time. Do not provide answers.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                0.5
            );

        let finalQuestion =
            cleanText(question);

        if (!finalQuestion) {
            throw new Error(
                "AI returned an empty interview question"
            );
        }

        finalQuestion =
            finalQuestion
                .replace(/^["']/, "")
                .replace(/["']$/, "")
                .trim();

        finalQuestion =
            finalQuestion.replace(
                /^\d+[.)]\s*/,
                ""
            );

        console.log(
            `✅ Question ${questionNumber} generated`
        );

        console.log(
            "Question:",
            finalQuestion
        );

        return finalQuestion;
    } catch (error) {
        console.error(
            "❌ Interview Question Error:",
            error.message
        );

        throw error;
    }
};

// =========================================================
// EVALUATE INTERVIEW ANSWER
// =========================================================

const evaluateInterviewAnswer = async ({
    question,
    answer,
    profile = {},
    interviewType = "Technical",
}) => {
    try {
        // -------------------------------------------------
        // BASIC VALIDATION
        // -------------------------------------------------

        question = cleanText(question);
        answer = cleanText(answer);

        if (!question) {
            throw new Error(
                "Interview question is missing"
            );
        }

        if (!answer) {
            throw new Error(
                "Interview answer is missing"
            );
        }

        // -------------------------------------------------
        // IMPORTANT:
        // CHECK ANSWER BEFORE ASKING OLLAMA
        // -------------------------------------------------

        const answerQuality =
            analyzeAnswerBasicQuality(answer);

        console.log(
            "======================================"
        );

        console.log(
            "🔍 ANSWER QUALITY CHECK"
        );

        console.log(
            "======================================"
        );

        console.log(
            "Answer:",
            answer
        );

        console.log(
            "Valid:",
            answerQuality.valid
        );

        console.log(
            "Reason:",
            answerQuality.reason
        );

        // -------------------------------------------------
        // INVALID / RANDOM ANSWER
        // -------------------------------------------------

        if (!answerQuality.valid) {
            console.log(
                "⚠️ Invalid / meaningless answer detected"
            );

            console.log(
                "⚠️ Ollama evaluation skipped"
            );

            const invalidEvaluation =
                createInvalidAnswerEvaluation(
                    answerQuality.reason
                );

            console.log(
                "Overall Score:",
                invalidEvaluation.overallScore
            );

            return invalidEvaluation;
        }

        // -------------------------------------------------
        // BASIC INFORMATION
        // -------------------------------------------------

        const careerGoal =
            profile.careerGoal ||
            "Software Developer";

        const skills =
            normalizeArray(profile.skills);

        // -------------------------------------------------
        // STRICT EVALUATION PROMPT
        // -------------------------------------------------

        const prompt = `
You are an extremely strict professional placement interview evaluator.

Your task is to evaluate ONLY the student's answer against the exact interview question.

INTERVIEW TYPE:
${interviewType}

CAREER GOAL:
${careerGoal}

STUDENT SKILLS:
${skills.join(", ") || "None"}

QUESTION:
${question}

STUDENT ANSWER:
${answer}

==================================================
STRICT EVALUATION RULES
==================================================

1. First determine whether the answer actually addresses the question.

2. Relevance is extremely important.

3. Do NOT give points simply because the answer contains English words.

4. Do NOT assume that a vague answer is correct.

5. Do NOT reward random text.

6. Do NOT invent information that is not present in the student's answer.

7. If the answer is unrelated to the question:
   - relevance must be 0 or 1
   - technicalAccuracy must be 0 or 1
   - completeness must be 0 or 1
   - overall score must be very low.

8. If the answer is technically incorrect:
   technicalAccuracy must be low.

9. If the answer contains only a small correct portion:
   give partial credit only.

10. If the answer is correct but incomplete:
    give a medium score.

11. If the answer is correct, relevant, clear and complete:
    give a high score.

12. An excellent answer must demonstrate actual understanding.

13. Do NOT give 4, 5 or 6 simply because the student attempted an answer.

14. A meaningless answer must receive 0.

15. "I don't know", "asdfgh", random characters, keyboard smashing,
    or unrelated text must receive 0.

==================================================
SCORING GUIDE
==================================================

0 = No meaningful answer / completely wrong / unrelated.

1-2 = Very poor understanding or mostly incorrect.

3-4 = Limited understanding with major mistakes.

5-6 = Partial understanding but important information is missing.

7-8 = Good and mostly correct answer.

9 = Very strong and complete answer.

10 = Excellent, accurate, relevant, clear and complete answer.

==================================================
FIVE CATEGORIES
==================================================

Technical Accuracy:
Does the answer contain technically correct information?

Relevance:
Does the answer directly answer the question?

Clarity:
Is the explanation understandable and logically organized?

Communication:
Does the student communicate the answer professionally?

Completeness:
Does the answer cover the important parts needed to answer the question?

==================================================
IMPORTANT
==================================================

Before assigning scores, compare the student's answer directly with the question.

If the answer does not answer the question, DO NOT give a medium score.

If the answer is meaningless, ALL FIVE SCORES MUST BE 0.

Return ONLY valid JSON.

Return exactly:

{
    "technicalAccuracy": 0,
    "relevance": 0,
    "clarity": 0,
    "communication": 0,
    "completeness": 0,
    "strengths": [],
    "improvements": [],
    "betterApproach": "",
    "feedback": ""
}
`;

        // -------------------------------------------------
        // LOG
        // -------------------------------------------------

        console.log(
            "======================================"
        );

        console.log(
            "🤖 OLLAMA INTERVIEW EVALUATION"
        );

        console.log(
            "======================================"
        );

        console.log(
            "Question:",
            question
        );

        console.log(
            "Answer:",
            answer
        );

        // -------------------------------------------------
        // OLLAMA REQUEST
        // -------------------------------------------------

        const rawResponse =
            await callOllama(
                [
                    {
                        role: "system",
                        content:
                            "You are an extremely strict placement interview evaluator. Return ONLY valid JSON. Never give points for meaningless or unrelated answers.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                0.05
            );

        // -------------------------------------------------
        // GET AI RESPONSE
        // -------------------------------------------------

        let result =
            cleanText(rawResponse);

        if (!result) {
            throw new Error(
                "AI returned an empty evaluation"
            );
        }

        console.log(
            "🤖 Raw Ollama Evaluation:"
        );

        console.log(result);

        // -------------------------------------------------
        // REMOVE MARKDOWN
        // -------------------------------------------------

        result =
            result
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        // -------------------------------------------------
        // EXTRACT JSON
        // -------------------------------------------------

        const firstBrace =
            result.indexOf("{");

        const lastBrace =
            result.lastIndexOf("}");

        if (
            firstBrace === -1 ||
            lastBrace === -1
        ) {
            throw new Error(
                "AI returned invalid evaluation format"
            );
        }

        result =
            result.substring(
                firstBrace,
                lastBrace + 1
            );

        // -------------------------------------------------
        // PARSE JSON
        // -------------------------------------------------

        let evaluation;

        try {
            evaluation =
                JSON.parse(result);
        } catch (parseError) {
            console.error(
                "❌ JSON Parse Error:",
                parseError.message
            );

            console.error(
                "❌ Ollama Result:",
                result
            );

            throw new Error(
                "AI returned invalid evaluation JSON"
            );
        }

        // =================================================
        // NORMALIZE SCORE
        // =================================================

        const normalizeScore = (value) => {
            const score =
                Number(value);

            if (
                Number.isNaN(score)
            ) {
                return 0;
            }

            return Number(
                Math.min(
                    10,
                    Math.max(
                        0,
                        score
                    )
                ).toFixed(1)
            );
        };

        let technicalAccuracy =
            normalizeScore(
                evaluation.technicalAccuracy
            );

        let relevance =
            normalizeScore(
                evaluation.relevance
            );

        let clarity =
            normalizeScore(
                evaluation.clarity
            );

        let communication =
            normalizeScore(
                evaluation.communication
            );

        let completeness =
            normalizeScore(
                evaluation.completeness
            );

        // =================================================
        // SECOND SAFETY CHECK
        // =================================================
        //
        // If the AI itself detects extremely low relevance,
        // prevent it from accidentally returning a medium
        // overall score.
        // =================================================

        if (relevance <= 1) {
            technicalAccuracy =
                Math.min(
                    technicalAccuracy,
                    1
                );

            clarity =
                Math.min(
                    clarity,
                    2
                );

            communication =
                Math.min(
                    communication,
                    2
                );

            completeness =
                Math.min(
                    completeness,
                    1
                );
        }

        // -------------------------------------------------
        // CALCULATE OVERALL SCORE
        // -------------------------------------------------

        const overallScore =
            Number(
                (
                    (
                        technicalAccuracy +
                        relevance +
                        clarity +
                        communication +
                        completeness
                    ) / 5
                ).toFixed(1)
            );

        // -------------------------------------------------
        // FINAL RESULT
        // -------------------------------------------------

        const finalEvaluation = {
            technicalAccuracy,
            relevance,
            clarity,
            communication,
            completeness,
            overallScore,

            strengths:
                Array.isArray(
                    evaluation.strengths
                )
                    ? evaluation.strengths
                          .filter(Boolean)
                          .map(String)
                    : [],

            improvements:
                Array.isArray(
                    evaluation.improvements
                )
                    ? evaluation.improvements
                          .filter(Boolean)
                          .map(String)
                    : [],

            betterApproach:
                typeof evaluation.betterApproach ===
                "string"
                    ? evaluation.betterApproach
                    : "",

            feedback:
                typeof evaluation.feedback ===
                "string"
                    ? evaluation.feedback
                    : "",
        };

        console.log(
            "======================================"
        );

        console.log(
            "✅ INTERVIEW EVALUATION SUCCESS"
        );

        console.log(
            "Technical Accuracy:",
            technicalAccuracy
        );

        console.log(
            "Relevance:",
            relevance
        );

        console.log(
            "Clarity:",
            clarity
        );

        console.log(
            "Communication:",
            communication
        );

        console.log(
            "Completeness:",
            completeness
        );

        console.log(
            "Overall Score:",
            overallScore
        );

        console.log(
            "======================================"
        );

        return finalEvaluation;

    } catch (error) {
        console.error(
            "❌ Interview Evaluation Error:",
            error.message
        );

        console.error(
            "❌ Stack:",
            error.stack
        );

        throw error;
    }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
    generateInterviewQuestion,
    evaluateInterviewAnswer,
};