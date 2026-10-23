const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    createRoadmap,
    getMyRoadmap,
    updateRoadmapProgress,
    getRoadmapProgress
} = require("../controllers/roadmapController");


// ==========================================
// Generate roadmap
// ==========================================

router.post(
    "/",
    protect,
    createRoadmap
);


// ==========================================
// Get roadmap progress
// ==========================================

router.get(
    "/progress",
    protect,
    getRoadmapProgress
);


// ==========================================
// Update completed step
// ==========================================

router.put(
    "/progress",
    protect,
    updateRoadmapProgress
);


// ==========================================
// Get saved roadmap
// ==========================================

router.get(
    "/",
    protect,
    getMyRoadmap
);


module.exports = router;