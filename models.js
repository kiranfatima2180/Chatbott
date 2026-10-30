// Lists the chat models currently available on your Groq account,
// so the dropdown always shows the latest ones automatically.
const SKIP = /whisper|tts|playai|guard|safeguard|orpheus|embed|distil-whisper/i;

export default async function handler(req, res) {
  const fallback = process.env.GROQ_DEFAULT_MODEL || "openai/gpt-oss-120b";
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "GROQ_API_KEY is not set", models: [fallback], default: fallback });

  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await r.json();
    let models = (data.data || []).filter((m) => m.active !== false && !SKIP.test(m.id)).map((m) => m.id).sort();
    if (!models.length) models = [fallback];
    const def = models.includes(fallback) ? fallback : models[0];
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.json({ models, default: def });
  } catch {
    res.json({ models: [fallback], default: fallback });
  }
}
