import type { Topic } from "./types";

type GroqResponse = {
  choices: { message: { content: string } }[];
};

const SYSTEM_PROMPT = `You are an assistant that splits university lecture material into individual study topics.

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
- Summaries must be grounded in the provided text only.`;

export async function detectTopics(text: string): Promise<Omit<Topic, "id" | "order" | "selected">[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  // Trim to stay within token limits — chunking is a later step.
  const trimmed = text.slice(0, 24000);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Lecture text:\n\n${trimmed}` },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as GroqResponse;
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { topics?: { title: string; summary: string }[] };

  const topics = parsed.topics ?? [];
  if (topics.length === 0) throw new Error("Groq returned no topics");

  return topics.map((t) => ({
    title: t.title?.trim() || "Untitled topic",
    summary: t.summary?.trim() || "",
  }));
}
