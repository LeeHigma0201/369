import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/news", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in .env" });
  }

  try {
    const { query, category } = req.body;

    const prompt = category
      ? `You are a news curator. Return a JSON array of 7 current, real news articles for "${category}" as of today. Each object: {"title":string,"source":string (real outlet),"summary":string (2 sentences),"fullText":string (3-4 paragraphs separated by \\n\\n),"bias":"left"|"center-left"|"center"|"center-right"|"right","annotations":[{"type":"fact-check"|"opinion"|"context","label":string,"detail":string}],"time":string,"readTime":number,"isBreaking":boolean (max 1),"url":string}. Diverse sources/perspectives. Return ONLY valid JSON array.`
      : `You are a news curator. Find current news about "${query}" as of today. Return a JSON array of 6 articles with same schema: {"title":string,"source":string,"summary":string,"fullText":string (\\n\\n between paragraphs),"bias":"left"|"center-left"|"center"|"center-right"|"right","annotations":[{"type":"fact-check"|"opinion"|"context","label":string,"detail":string}],"time":string,"readTime":number,"isBreaking":boolean,"url":string}. Multiple perspectives. ONLY valid JSON array.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const articles = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(articles);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Walls News+ API proxy running on http://localhost:${PORT}`);
});
