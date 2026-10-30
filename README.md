# ⚡ Groq Chat — ChatGPT-style chatbot

Streaming chat UI powered by the [Groq API](https://console.groq.com). No build step, no dependencies.

**Features:** streaming replies · stop button · markdown + code blocks with copy · chat history (saved in browser) · live model dropdown (auto-lists the latest models on your Groq account) · dark/light mode · mobile friendly · API key kept server-side.

Default model: `openai/gpt-oss-120b` (change with the `GROQ_DEFAULT_MODEL` env var).

## Deploy (5 minutes)

1. Get a free key: https://console.groq.com/keys
2. Create a new GitHub repo and upload all files from this folder (keep the `api/` folder).
3. Go to https://vercel.com/new → import the repo → framework preset **Other** (leave defaults).
4. Before deploying, open **Environment Variables** and add:
   - `GROQ_API_KEY` = your key (`gsk_...`)
5. Click **Deploy**. Done.

If you add the key after deploying, go to Settings → Environment Variables, then **Redeploy**.

## Run locally

```bash
npm i -g vercel
cp .env.example .env     # put your key in .env
vercel dev
```
