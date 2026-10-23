const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    uploadResume,
    getMyResumes,
    getResumeById,
    getResumeAnalytics
} = require("../controllers/resumeController");

// Upload resume
router.post(
    "/upload",
    authMiddleware,
    upload.single("resume"),
    uploadResume
);

// Resume analytics
router.get(
    "/analytics",
    authMiddleware,
    getResumeAnalytics
);

// Get all resumes
router.get(
    "/",
    authMiddleware,
    getMyResumes
);

// Get one resume
router.get(
    "/:id",
    authMiddleware,
    getResumeById
);

module.exports = router;