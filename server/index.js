// server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini 2.0 error:", error.response?.data || error.message);
    res.status(500).json({ error: "Gemini 2.0 failed to respond." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
