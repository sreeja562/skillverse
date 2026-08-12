const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const { analyzeResume } = require("../services/aiResumeService");
const Resume = require("../models/Resume");

// Upload Resume
const uploadResume = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF resume"
            });
        }

        const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            req.file.filename
        );

        console.log("========== RESUME DEBUG ==========");
        console.log("File Name:", req.file.filename);
        console.log("File Path:", filePath);
        console.log("File Exists:", fs.existsSync(filePath));

        const pdfBuffer = fs.readFileSync(filePath);

        console.log("Buffer Size:", pdfBuffer.length);

        // Extract PDF Text
        const pdfData = await pdfParse(pdfBuffer);
        const extractedText = pdfData.text;

        console.log("Extracted Characters:", extractedText.length);

        // AI Analysis
        const analysis = await analyzeResume(extractedText);

        // Save Resume
        const resume = await Resume.create({
            user: req.user.id,
            fileName: req.file.filename,
            extractedText,
            analysis: {
                score: analysis.score,
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
                suggestions: analysis.suggestions
            }
        });

        return res.status(201).json({
            success: true,
            message: "Resume uploaded and analyzed successfully",
            resume
        });

    } catch (error) {

        console.error("Resume Upload Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Resumes
const getMyResumes = async (req, res) => {
    try {

        const resumes = await Resume.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            resumes
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Resume By ID
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

        return res.json({
            success: true,
            resume
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    uploadResume,
    getMyResumes,
    getResumeById
};