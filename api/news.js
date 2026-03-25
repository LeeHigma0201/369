export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const { query, category } = req.body;

    if (!query && !category) {
      return res.status(400).json({ error: "Missing query or category" });
    }

    const prompt = category
      ? `You are a news curator. Return a JSON array of 7 current, real news articles for "${category}" as of today. Each object: {"title":string,"source":string (real outlet),"summary":string (2 sentences),"fullText":string (3-4 paragraphs separated by \\n\\n),"bias":"left"|"center-left"|"center"|"center-right"|"right","annotations":[{"type":"fact-check"|"opinion"|"context","label":string,"detail":string}],"time":string,"readTime":number,"isBreaking":boolean (max 1),"url":string}. Diverse sources/perspectives. Return ONLY valid JSON array.`
      : `You are a news curator. Find current news about "${query}" as of today. Return a JSON array of 6 articles with same schema: {"title":string,"source":string,"summary":string,"fullText":string (\\n\\n between paragraphs),"bias":"left"|"center-left"|"center"|"center-right"|"right","annotations":[{"type":"fact-check"|"opinion"|"context","label":string,"detail":string}],"time":string,"readTime":number,"isBreaking":boolean,"url":string}. Multiple perspectives. ONLY valid JSON array.`;

    const requestBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: prompt }],
    };

    console.log("Calling Anthropic API with model:", requestBody.model);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, JSON.stringify(data));
      return res.status(response.status).json({ error: data });
    }

    console.log("Anthropic response stop_reason:", data.stop_reason);

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (!text) {
      console.error("No text in response, content types:", (data.content || []).map(b => b.type));
      return res.status(502).json({ error: "No text response from API" });
    }

    const articles = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(articles);
  } catch (err) {
    console.error("API error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch news", detail: err.message });
  }
}
