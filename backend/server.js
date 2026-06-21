const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is alive!");
});

// Generate a story (doesn't save it)
app.post("/api/story", async (req, res) => {
  try {
    const { character, location, theme } = req.body;

    const prompt = `Write a short, gentle bedtime story (around 150 words) for kids.
Character: ${character}
Place: ${location}
Theme: ${theme}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const story = data.candidates[0].content.parts[0].text;

    res.json({ story });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

// Save a story to the database
app.post("/api/save", async (req, res) => {
  try {
    const { character, location, theme, story } = req.body;

    const result = await pool.query(
      `INSERT INTO stories (character_name, location_name, theme, story)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [character, location, theme, story]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save story" });
  }
});

// Get all saved stories
app.get("/api/stories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM stories ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

// Delete a saved story
app.delete("/api/stories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM stories WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete story" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});