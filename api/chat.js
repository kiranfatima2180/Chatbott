export const config = { maxDuration: 60 };

// Vercel serverless function: proxies chat requests to Groq and streams the reply.
// The API key stays on the server and is never exposed to the browser.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "GROQ_API_KEY is not set in Vercel Environment Variables." });

  const { messages, model, temperature = 0.7 } = req.body || {};
  if (!Array.isArray(messages) || !messages.length)
    return res.status(400).json({ error: "messages array is required" });

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model || process.env.GROQ_DEFAULT_MODEL || "openai/gpt-oss-120b",
      messages: messages.slice(-40),
      temperature,
      stream: true,
    }),
  }).catch((e) => ({ ok: false, status: 502, text: async () => e.message }));

  if (!upstream.ok) {
    const text = await upstream.text();
    let msg = text;
    try { msg = JSON.parse(text).error?.message || text; } catch {}
    return res.status(upstream.status).json({ error: msg });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const reader = upstream.body.getReader();
  req.on("close", () => reader.cancel().catch(() => {}));
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } catch {}
  res.end();
}
