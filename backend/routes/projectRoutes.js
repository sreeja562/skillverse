const express = require("express");

const {
    recommendProjects
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, recommendProjects);

module.exports = router;