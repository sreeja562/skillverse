const express = require("express");

const {
    calculateReadiness
} = require("../controllers/readinessController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, calculateReadiness);

module.exports = router;