import json
import os
import httpx

SYSTEM_PROMPT = """You are an assistant that splits university lecture material into individual study topics.

Return ONLY valid JSON in this exact shape:
{
  "topics": [
    { "title": "Short topic title", "summary": "One or two sentence summary of what this topic covers." }
  ]
}

Rules:
- Each topic should be something a student would call a separate topic to learn.
- Do NOT return one single topic for the whole document.
- Do NOT return every paragraph as a topic.
- Aim for 3 to 12 topics depending on document length.
- Use the lecturer's terminology. Do not invent content.
- Summaries must be grounded in the provided text only."""

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"


def detect_topics(text: str) -> list[dict]:
    api_key = os.environ["GROQ_API_KEY"]
    trimmed = text[:24000]

    with httpx.Client(timeout=60.0) as client:
        res = client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Lecture text:\n\n{trimmed}"},
                ],
            },
        )
        res.raise_for_status()
        data = res.json()

    raw = data["choices"][0]["message"]["content"]
    parsed = json.loads(raw)
    topics = parsed.get("topics", [])
    if not topics:
        raise Exception("Groq returned no topics")
    return [{"title": t.get("title", "Untitled").strip(), "summary": t.get("summary", "").strip()} for t in topics]
