
const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public')); 

const OPENROUTER_KEY = process.env.PROJECT_API_KEY;


app.post('/api/ai', async (req, res) => {
  try {
    const userText = req.body.text;

    if (!userText) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
        "X-Title": "Vision Terminal v1"         
      },
      body: JSON.stringify({
        "model": "openai/gpt-oss-120b:free",
        "messages": [
          { "role": "system", "content": "You are a gritty, industrial AI terminal. Keep responses concise and cold and detailed." },
          { "role": "user", "content": userText }
        ]
      })
    });

   
    if (!response.ok) {
      const errorDetail = await response.json();
      console.error("OpenRouter API Error:", errorDetail);
      throw new Error(errorDetail.error?.message || "Failed to contact AI");
    }

    const data = await response.json();

   
    if (data.choices && data.choices.length > 0) {
      const aiText = data.choices[0].message.content;
      res.json({ answer: aiText });
    } else {
      console.error("Unexpected Data Structure:", data);
      res.status(500).json({ error: "Empty response from AI" });
    }

  } catch (err) {
    console.error("Server Side Error:", err.message);
    res.status(500).json({ error: "Signal Lost: " + err.message });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`TERMINAL ONLINE: http://localhost:${PORT}`);
  console.log(`STATUS: SENSORS ACTIVE`);
  console.log(`-------------------------------------------`);
});
