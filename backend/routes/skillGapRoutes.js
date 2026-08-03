const express = require("express");

const {
    detectSkillGap
} = require("../controllers/skillGapController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, detectSkillGap);

module.exports = router;