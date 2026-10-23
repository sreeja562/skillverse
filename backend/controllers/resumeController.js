const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const { analyzeResume } = require("../services/aiResumeService");
const Resume = require("../models/Resume");

// =====================================================
// Upload Resume
// =====================================================
const uploadResume = async (req, res) => {
    try {
        // Check file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF resume"
            });
        }

        // Make sure uploaded file is PDF
        const isPdf =
            req.file.mimetype === "application/pdf" ||
            path.extname(req.file.originalname || "").toLowerCase() === ".pdf";

        if (!isPdf) {
            return res.status(400).json({
                success: false,
                message: "Only PDF resumes are allowed"
            });
        }

        // =================================================
        // File Path
        // =================================================
        const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            req.file.filename
        );

        console.log("========== RESUME DEBUG ==========");
        console.log("File Name:", req.file.filename);
        console.log("Original Name:", req.file.originalname);
        console.log("File Path:", filePath);
        console.log("File Exists:", fs.existsSync(filePath));

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({
                success: false,
                message: "Uploaded resume file could not be found"
            });
        }

        // =================================================
        // Read PDF
        // =================================================
        const pdfBuffer = fs.readFileSync(filePath);

        console.log("Buffer Size:", pdfBuffer.length);

        if (!pdfBuffer || pdfBuffer.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Uploaded PDF is empty"
            });
        }

        // =================================================
        // Extract PDF Text
        // =================================================
        const pdfData = await pdfParse(pdfBuffer);

        const extractedText = String(pdfData?.text || "").trim();

        console.log(
            "Extracted Characters:",
            extractedText.length
        );

        // =================================================
        // Check extracted text
        // =================================================
        if (extractedText.length < 20) {
            return res.status(400).json({
                success: false,
                message:
                    "Unable to extract enough text from this PDF. Please upload a text-based PDF resume instead of a scanned/image-only PDF."
            });
        }

        // =================================================
        // AI Resume Analysis
        // =================================================
        let analysis;

        try {
            analysis = await analyzeResume(extractedText);
        } catch (aiError) {
            console.error(
                "Resume AI Analysis Error:",
                aiError
            );

            // We can still save the resume even if AI fails
            analysis = {
                score: 0,
                strengths: [],
                weaknesses: [],
                suggestions: []
            };
        }

        // =================================================
        // Ensure Analysis Data Is Safe
        // =================================================
        const safeAnalysis = {
            score:
                typeof analysis?.score === "number"
                    ? analysis.score
                    : 0,

            strengths: Array.isArray(analysis?.strengths)
                ? analysis.strengths
                : [],

            weaknesses: Array.isArray(analysis?.weaknesses)
                ? analysis.weaknesses
                : [],

            suggestions: Array.isArray(analysis?.suggestions)
                ? analysis.suggestions
                : []
        };

        // =================================================
        // Save Resume
        // =================================================
        const resume = await Resume.create({
            user: req.user.id,

            fileName:
                req.file.originalname ||
                req.file.filename,

            extractedText,

            analysis: safeAnalysis
        });

        console.log(
            "Resume saved successfully:",
            resume._id
        );

        // =================================================
        // Response
        // =================================================
        return res.status(201).json({
            success: true,
            message: "Resume uploaded and analyzed successfully",
            resume
        });

    } catch (error) {
        console.error("========== RESUME UPLOAD ERROR ==========");
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Unable to upload and analyze resume"
        });
    }
};


// =====================================================
// Get All Resumes
// =====================================================
const getMyResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            resumes
        });

    } catch (error) {
        console.error(
            "Get Resumes Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Unable to fetch resumes"
        });
    }
};


// =====================================================
// Get Resume By ID
// =====================================================
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        return res.status(200).json({
            success: true,
            resume
        });

    } catch (error) {
        console.error(
            "Get Resume By ID Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Unable to fetch resume"
        });
    }
};


// =====================================================
// Resume Analytics
// =====================================================
const getResumeAnalytics = async (req, res) => {
    try {
        const resumes = await Resume.find({
            user: req.user.id
        }).sort({
            createdAt: 1
        });

        // No resumes
        if (resumes.length === 0) {
            return res.status(200).json({
                success: true,
                analytics: {
                    totalResumes: 0,
                    averageScore: 0,
                    highestScore: 0,
                    latestScore: 0,
                    scoreHistory: []
                }
            });
        }

        // =================================================
        // Get Scores
        // =================================================
        const scores = resumes.map((resume) => {
            const score = Number(
                resume.analysis?.score || 0
            );

            return Number.isFinite(score)
                ? score
                : 0;
        });

        const totalResumes = resumes.length;

        const averageScore = Math.round(
            scores.reduce(
                (sum, score) => sum + score,
                0
            ) / totalResumes
        );

        const highestScore = Math.max(
            ...scores
        );

        const latestScore =
            scores[scores.length - 1];

        // =================================================
        // Score History
        // =================================================
        const scoreHistory = resumes.map(
            (resume) => ({
                resumeId: resume._id,
                fileName: resume.fileName,
                score:
                    Number(
                        resume.analysis?.score || 0
                    ),
                date: resume.createdAt
            })
        );

        return res.status(200).json({
            success: true,
            analytics: {
                totalResumes,
                averageScore,
                highestScore,
                latestScore,
                scoreHistory
            }
        });

    } catch (error) {
        console.error(
            "Resume Analytics Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Unable to generate resume analytics"
        });
    }
};


// =====================================================
// Export Controllers
// =====================================================
module.exports = {
    uploadResume,
    getMyResumes,
    getResumeById,
    getResumeAnalytics
};