const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    getReadiness
} = require("../controllers/readinessController");

router.get(
    "/",
    protect,
    getReadiness
);

module.exports = router;