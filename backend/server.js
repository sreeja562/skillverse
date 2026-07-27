const express = require("express");

// Create Express application
const app = express();

// Server Port
const PORT = 5000;

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to SkillVerse Backend");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});