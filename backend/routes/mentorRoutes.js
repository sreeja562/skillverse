const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  startInterview,
  submitInterviewAnswer,
  nextInterviewQuestion,
  completeInterview,
} = require("../controllers/mentorController");

router.post("/start", protect, startInterview);
router.post("/answer", protect, submitInterviewAnswer);
router.post("/next", protect, nextInterviewQuestion);
router.post("/complete", protect, completeInterview);

module.exports = router;