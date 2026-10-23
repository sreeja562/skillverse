const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    startInterview,
    submitInterviewAnswer,
    nextInterviewQuestion,
    completeInterview
} = require("../controllers/mentorController");


// Start interview
router.post(
    "/start",
    protect,
    startInterview
);


// Submit answer
router.post(
    "/answer",
    protect,
    submitInterviewAnswer
);


// Get next question
router.post(
    "/next",
    protect,
    nextInterviewQuestion
);


// Complete interview
router.post(
    "/complete",
    protect,
    completeInterview
);


module.exports = router;