export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { query, category } = req.body;

    if (!query && !category) {
      return res.status(400).json({ error: "Missing query or category" });
    }

    const topic = category || query;
    const prompt = category
      ? `You are a news curator. Search for the latest current news articles about "${category}". Return a JSON array of 7 articles. Each object must have: {"title":string,"source":string (real outlet name),"summary":string (2 sentences),"fullText":string (3-4 paragraphs separated by \\n\\n),"bias":"left"|"center-left"|"center"|"center-right"|"right","annotations":[{"type":"fact-check"|"opinion"|"context","label":string,"detail":string}],"time":string (relative like "2 hours ago"),"readTime":number (minutes),"isBreaking":boolean (max 1 true),"url":string (real URL)}. Use diverse sources and perspectives. Return ONLY a valid JSON array, no other text.`
      : `You are a news curator. Search for current news about "${query}". Return a JSON array of 6 articles. Each object must have: {"title":string,"source":string (real outlet name),"summary":string (2 sentences),"fullText":string (3-4 paragraphs separated by \\n\\n),"bias":"left"|"center-left"|"center"|"center-right"|"right","annotations":[{"type":"fact-check"|"opinion"|"context","label":string,"detail":string}],"time":string (relative like "2 hours ago"),"readTime":number (minutes),"isBreaking":boolean (max 1 true),"url":string (real URL)}. Multiple perspectives. Return ONLY a valid JSON array, no other text.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    console.log("Calling Gemini API for topic:", topic);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, JSON.stringify(data));
      return res.status(response.status).json({ error: data });
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      ?.map((p) => p.text)
      ?.join("") || "";

    console.log("Gemini response length:", text.length);

    if (!text) {
      console.error("No text in Gemini response");
      return res.status(502).json({ error: "No text response from API" });
    }

    const articles = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(articles);
  } catch (err) {
    console.error("API error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch news", detail: err.message });
  }
}
