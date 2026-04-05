const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Detect single image
router.post("/detect-emotion", async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.AI_SERVICE_URL}/detect-emotion`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error connecting to AI service:", error);
    res.status(500).json({ error: "AI service connection failed" });
  }
});

// Multi-frame detection
router.post("/detect-emotion-multi", async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.AI_SERVICE_URL}/detect-emotion-multi`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error connecting to AI service:", error);
    res.status(500).json({ error: "AI service connection failed" });
  }
});

module.exports = router;