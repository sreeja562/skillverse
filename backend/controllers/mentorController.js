const User = require("../models/User");

const {
    analyzeSkillGap
} = require("../services/skillGapService");

const {
    generateMentorResponse
} = require("../services/mentorService");

const {
    generateInterviewQuestion,
    evaluateInterviewAnswer
} = require("../services/interviewService");

const Interview = require("../models/Interview");


// =========================================================
// AI MENTOR CHAT
// =========================================================

const chatWithMentor = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || !message.trim()) {

            return res.status(400).json({
                success: false,
                message: "Message is required"
            });

        }

        const userId = req.user.id;

        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });

        }

        const user = await User
            .findById(userId)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const profile = {

            name: user.name,

            careerGoal:
                user.careerGoal || "",

            skills:
                Array.isArray(user.skills)
                    ? user.skills
                    : [],

            interests:
                Array.isArray(user.interests)
                    ? user.interests
                    : [],

            experienceLevel:
                user.experienceLevel || "Beginner",

            education:
                user.education || {},

            certifications:
                Array.isArray(user.certifications)
                    ? user.certifications
                    : []
        };


        const projects =
            Array.isArray(user.projects)
                ? user.projects
                : [];


        let skillGap = {

            careerGoal:
                user.careerGoal || "",

            resumeSkills: [],

            profileSkills:
                user.skills || [],

            matchingSkills: [],

            missingSkills: [],

            prioritySkills: [],

            roadmap: []
        };


        try {

            skillGap = await analyzeSkillGap({

                skills:
                    user.skills || [],

                careerGoal:
                    user.careerGoal || "",

                resumeText: ""

            });

        } catch (skillGapError) {

            console.error(
                "⚠️ Skill Gap calculation failed:",
                skillGapError.message
            );

        }


        const response =
            await generateMentorResponse({

                message,

                profile,

                skillGap,

                projects,

                roadmap:
                    skillGap.roadmap || []

            });


        return res.status(200).json({

            success: true,

            response,

            context: {

                careerGoal:
                    skillGap.careerGoal,

                matchingSkills:
                    skillGap.matchingSkills,

                missingSkills:
                    skillGap.missingSkills,

                prioritySkills:
                    skillGap.prioritySkills

            }

        });

    } catch (error) {

        console.error(
            "❌ AI Mentor Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to get response from AI Mentor"

        });

    }

};


// =========================================================
// START MOCK INTERVIEW
// =========================================================

const startInterview = async (req, res) => {

    try {

        const {
            interviewType = "Technical"
        } = req.body;


        const allowedTypes = [
            "Technical",
            "HR",
            "Behavioral",
            "Project",
            "Coding",
            "Mixed"
        ];


        if (!allowedTypes.includes(interviewType)) {

            return res.status(400).json({

                success: false,

                message: "Invalid interview type"

            });

        }


        const userId = req.user.id;


        const user = await User
            .findById(userId)
            .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // ---------------------------------------------------
        // PROFILE
        // ---------------------------------------------------

        const profile = {

            name: user.name,

            careerGoal:
                user.careerGoal || "",

            skills:
                Array.isArray(user.skills)
                    ? user.skills
                    : [],

            experienceLevel:
                user.experienceLevel || "Beginner"

        };


        // ---------------------------------------------------
        // PROJECTS
        // ---------------------------------------------------

        const projects =
            Array.isArray(user.projects)
                ? user.projects
                : [];


        // ---------------------------------------------------
        // SKILL GAP
        // ---------------------------------------------------

        let skillGap = {

            careerGoal:
                user.careerGoal || "",

            missingSkills: [],

            prioritySkills: []

        };


        try {

            skillGap = await analyzeSkillGap({

                skills:
                    user.skills || [],

                careerGoal:
                    user.careerGoal || "",

                resumeText: ""

            });

        } catch (error) {

            console.log(
                "⚠️ Skill Gap unavailable for interview"
            );

        }


        // ---------------------------------------------------
        // CREATE INTERVIEW
        // ---------------------------------------------------

        const interview = await Interview.create({

            user: userId,

            interviewType,

            careerGoal:
                user.careerGoal || "",

            questions: [],

            completed: false

        });


        // ---------------------------------------------------
        // GENERATE FIRST QUESTION
        // ---------------------------------------------------

        const question =
            await generateInterviewQuestion({

                profile,

                skillGap,

                projects,

                interviewType,

                questionNumber: 1,

                previousQuestions: []

            });


        // ---------------------------------------------------
        // SAVE QUESTION
        // ---------------------------------------------------

        interview.questions.push({

            question

        });


        await interview.save();


        return res.status(201).json({

            success: true,

            interviewId:
                interview._id,

            interviewType,

            questionNumber: 1,

            question

        });

    } catch (error) {

        console.error(
            "❌ Start Interview Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to start interview"

        });

    }

};


// =========================================================
// SUBMIT INTERVIEW ANSWER
// =========================================================

const submitInterviewAnswer = async (req, res) => {

    try {

        const {
            interviewId,
            answer
        } = req.body;


        if (!interviewId || !answer || !answer.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Interview ID and answer are required"

            });

        }


        const interview =
            await Interview.findOne({

                _id: interviewId,

                user: req.user.id

            });


        if (!interview) {

            return res.status(404).json({

                success: false,

                message:
                    "Interview not found"

            });

        }


        if (interview.completed) {

            return res.status(400).json({

                success: false,

                message:
                    "Interview has already been completed"

            });

        }


        // ---------------------------------------------------
        // GET CURRENT QUESTION
        // ---------------------------------------------------

        const unansweredQuestion =
            interview.questions.find(
                (item) =>
                    !item.answer
            );


        if (!unansweredQuestion) {

            return res.status(400).json({

                success: false,

                message:
                    "No unanswered question found"

            });

        }


        const user =
            await User.findById(req.user.id)
                .select("-password");


        const profile = {

            careerGoal:
                user?.careerGoal || "",

            skills:
                user?.skills || []

        };


        // ---------------------------------------------------
        // EVALUATE ANSWER
        // ---------------------------------------------------

        const evaluation =
            await evaluateInterviewAnswer({

                question:
                    unansweredQuestion.question,

                answer,

                profile,

                interviewType:
                    interview.interviewType

            });


        // ---------------------------------------------------
        // SAVE ANSWER + EVALUATION
        // ---------------------------------------------------

        unansweredQuestion.answer =
            answer;

        unansweredQuestion.evaluation =
            evaluation;


        await interview.save();


        return res.status(200).json({

            success: true,

            evaluation,

            questionNumber:
                interview.questions.length

        });

    } catch (error) {
    console.error(
        "❌ Submit Interview Answer Error:",
        error
    );

    console.error(
        "❌ Error Message:",
        error.message
    );

    console.error(
        "❌ Error Stack:",
        error.stack
    );

    return res.status(500).json({
        success: false,
        message: "Unable to evaluate answer",
        error: error.message
    });
}

}

// =========================================================
// NEXT INTERVIEW QUESTION
// =========================================================

const nextInterviewQuestion = async (req, res) => {

    try {

        const {
            interviewId
        } = req.body;


        if (!interviewId) {

            return res.status(400).json({

                success: false,

                message:
                    "Interview ID is required"

            });

        }


        const interview =
            await Interview.findOne({

                _id: interviewId,

                user: req.user.id

            });


        if (!interview) {

            return res.status(404).json({

                success: false,

                message:
                    "Interview not found"

            });

        }


        if (interview.completed) {

            return res.status(400).json({

                success: false,

                message:
                    "Interview already completed"

            });

        }


        // ---------------------------------------------------
        // LIMIT INTERVIEW TO 5 QUESTIONS
        // ---------------------------------------------------

        const MAX_QUESTIONS = 5;


        if (
            interview.questions.length >=
            MAX_QUESTIONS
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Maximum interview questions reached",

                completed: true

            });

        }


        const user =
            await User.findById(req.user.id)
                .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        const profile = {

            careerGoal:
                user.careerGoal || "",

            skills:
                user.skills || [],

            experienceLevel:
                user.experienceLevel || "Beginner"

        };


        const projects =
            Array.isArray(user.projects)
                ? user.projects
                : [];


        let skillGap = {

            careerGoal:
                user.careerGoal || "",

            missingSkills: [],

            prioritySkills: []

        };


        try {

            skillGap = await analyzeSkillGap({

                skills:
                    user.skills || [],

                careerGoal:
                    user.careerGoal || "",

                resumeText: ""

            });

        } catch (error) {

            console.log(
                "⚠️ Skill Gap unavailable"
            );

        }


        const previousQuestions =
            interview.questions.map(
                (item) =>
                    item.question
            );


        const questionNumber =
            interview.questions.length + 1;


        const question =
            await generateInterviewQuestion({

                profile,

                skillGap,

                projects,

                interviewType:
                    interview.interviewType,

                questionNumber,

                previousQuestions

            });


        interview.questions.push({

            question

        });


        await interview.save();


        return res.status(200).json({

            success: true,

            questionNumber,

            question,

            interviewId:
                interview._id

        });

    } catch (error) {

        console.error(
            "❌ Next Interview Question Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to generate next question"

        });

    }

};


// =========================================================
// COMPLETE INTERVIEW
// =========================================================

const completeInterview = async (req, res) => {

    try {

        const {
            interviewId
        } = req.body;


        if (!interviewId) {

            return res.status(400).json({

                success: false,

                message:
                    "Interview ID is required"

            });

        }


        const interview =
            await Interview.findOne({

                _id: interviewId,

                user: req.user.id

            });


        if (!interview) {

            return res.status(404).json({

                success: false,

                message:
                    "Interview not found"

            });

        }


        const completedQuestions =
            interview.questions.filter(
                (question) =>
                    question.answer &&
                    question.evaluation
            );


        if (
            completedQuestions.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No completed questions"

            });

        }


        // ---------------------------------------------------
        // CALCULATE TOTAL SCORE
        // ---------------------------------------------------

        const scores =
            completedQuestions.map(
                (question) =>
                    Number(
                        question
                            .evaluation
                            .overallScore || 0
                    )
            );


        const total =
            scores.reduce(
                (sum, score) =>
                    sum + score,
                0
            );


        const average =
            total / scores.length;


        interview.totalScore =
            Number(
                average.toFixed(2)
            );


        interview.completed =
            true;


        await interview.save();


        return res.status(200).json({

            success: true,

            message:
                "Interview completed successfully",

            interviewId:
                interview._id,

            totalScore:
                interview.totalScore,

            totalQuestions:
                completedQuestions.length,

            questions:
                interview.questions

        });

    } catch (error) {

        console.error(
            "❌ Complete Interview Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to complete interview"

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    chatWithMentor,

    startInterview,

    submitInterviewAnswer,

    nextInterviewQuestion,

    completeInterview

};