const express = require("express");

const {
    careerMentor
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/mentor", protect, careerMentor);

module.exports = router;