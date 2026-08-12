const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    uploadResume,
    getMyResumes,
    getResumeById
} = require("../controllers/resumeController");

router.post(
    "/upload",
    authMiddleware,
    upload.single("resume"),
    uploadResume
);

router.get("/", authMiddleware, getMyResumes);

router.get("/:id", authMiddleware, getResumeById);

module.exports = router;