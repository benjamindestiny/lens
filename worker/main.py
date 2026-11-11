import os
import re
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

import httpx
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

from prompts import SYSTEM_PROMPT, build_user_prompt
from narrate import synthesize
from render import render_lesson, extract_points

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def generate_script(topic_title: str, topic_summary: str, lecture_text: str) -> str:
    user_prompt = build_user_prompt(topic_title, topic_summary, lecture_text)
    with httpx.Client(timeout=60.0) as client:
        res = client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "temperature": 0.4,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            },
        )
        res.raise_for_status()
        data = res.json()
    return data["choices"][0]["message"]["content"].strip()


def get_lecture_text(document_id: str) -> str:
    row = (
        supabase.table("documents")
        .select("extracted_text")
        .eq("id", document_id)
        .single()
        .execute()
    ).data
    return (row or {}).get("extracted_text") or ""


def fail_lesson(lesson_id: str, msg: str):
    supabase.table("lessons").update(
        {"status": "failed", "error": msg[:300]}
    ).eq("id", lesson_id).execute()


def process_lesson(lesson: dict) -> bool:
    lesson_id = lesson["id"]
    document_id = lesson["document_id"]
    topic_id = lesson["topic_id"]

    topic = (
        supabase.table("topics")
        .select("title, summary")
        .eq("id", topic_id)
        .single()
        .execute()
    ).data
    if not topic:
        fail_lesson(lesson_id, "Topic no longer exists for this lesson.")
        return False

    existing = (
        supabase.table("lesson_scripts")
        .select("script")
        .eq("lesson_id", lesson_id)
        .execute()
    ).data

    if existing:
        script = existing[0]["script"]
    else:
        lecture_text = get_lecture_text(document_id)
        print(f"[script] lesson {lesson_id}: {topic['title']}")
        script = generate_script(topic["title"], topic.get("summary", ""), lecture_text)
        supabase.table("lesson_scripts").insert(
            {
                "lesson_id": lesson_id,
                "topic_title": topic["title"],
                "script": script,
                "word_count": word_count(script),
            }
        ).execute()
        supabase.table("lessons").update({"status": "scripted", "scripted_at": now_iso()}).eq("id", lesson_id).execute()
        print(f"[script] wrote {word_count(script)} words")

    supabase.table("lessons").update({"status": "narrating"}).eq("id", lesson_id).execute()
    print(f"[narrate] lesson {lesson_id}")
    audio_bytes, audio_seconds = synthesize(script)

    audio_path = f"{document_id}/{lesson_id}.wav"
    supabase.storage.from_("lesson-audio").upload(
        audio_path, audio_bytes, {"content-type": "audio/wav", "upsert": "true"}
    )
    audio_url = supabase.storage.from_("lesson-audio").get_public_url(audio_path)
    supabase.table("lessons").update(
        {"status": "narrated", "audio_url": audio_url, "audio_seconds": audio_seconds, "narrated_at": now_iso()}
    ).eq("id", lesson_id).execute()
    print(f"[narrate] wrote {audio_seconds:.1f}s of audio")

    points = extract_points(script)
    print(f"[render] lesson {lesson_id}")
    video_bytes = render_lesson(topic["title"], points, audio_url, audio_seconds)

    video_path = f"{document_id}/{lesson_id}.mp4"
    supabase.storage.from_("lesson-video").upload(
        video_path, video_bytes, {"content-type": "video/mp4", "upsert": "true"}
    )
    video_url = supabase.storage.from_("lesson-video").get_public_url(video_path)
    supabase.table("lessons").update(
        {
            "status": "ready",
            "video_url": video_url,
            "duration_seconds": int(audio_seconds),
            "ready_at": now_iso(),
        }
    ).eq("id", lesson_id).execute()
    print(f"[render] wrote {len(video_bytes) // 1024} KB video")

    return True


def process_pending_documents() -> int:
    from extract_text import extract_text_from_file
    from detect_topics import detect_topics

    # Pass 1: extract text for processing documents
    processing = (
        supabase.table("documents")
        .select("id, filename, storage_path")
        .eq("status", "processing")
        .limit(2)
        .execute()
    ).data

    for doc in processing:
        try:
            print(f"[extract] {doc['id']}")
            data = supabase.storage.from_("lectures").download(doc["storage_path"])
            text = extract_text_from_file(data, doc["filename"])
            if not text or len(text.strip()) < 50:
                raise Exception("Extracted text was too short to analyse.")
            supabase.table("documents").update({
                "extracted_text": text,
                "status": "detecting_topics",
            }).eq("id", doc["id"]).execute()
            print(f"[extract] {len(text)} chars")
        except Exception as e:
            supabase.table("documents").update({
                "status": "failed", "error": str(e)[:300],
            }).eq("id", doc["id"]).execute()
            print(f"[extract] failed: {e}")

    # Pass 2: detect topics for detecting_topics documents
    detecting = (
        supabase.table("documents")
        .select("id, extracted_text")
        .eq("status", "detecting_topics")
        .limit(2)
        .execute()
    ).data

    for doc in detecting:
        try:
            print(f"[topics] {doc['id']}")
            topics = detect_topics(doc["extracted_text"] or "")
            supabase.table("topics").delete().eq("document_id", doc["id"]).execute()
            rows = [
                {"document_id": doc["id"], "title": t["title"], "summary": t["summary"], "order": i + 1, "selected": True}
                for i, t in enumerate(topics)
            ]
            supabase.table("topics").insert(rows).execute()
            supabase.table("documents").update({"status": "topics_ready"}).eq("id", doc["id"]).execute()
            print(f"[topics] {len(rows)} topics")
        except Exception as e:
            supabase.table("documents").update({
                "status": "failed", "error": str(e)[:300],
            }).eq("id", doc["id"]).execute()
            print(f"[topics] failed: {e}")

    return len(processing) + len(detecting)

def process_pending_lessons() -> int:
    lessons = (
        supabase.table("lessons")
        .select("id, document_id, topic_id, title, status")
        .eq("status", "queued")
        .limit(3)
        .execute()
    ).data

    if not lessons:
        return 0

    for lesson in lessons:
        try:
            process_lesson(lesson)
        except Exception as e:
            msg = str(e)
            print(f"[worker] lesson {lesson['id']} failed: {msg[:200]}")
            fail_lesson(lesson["id"], msg)

        remaining = (
            supabase.table("lessons")
            .select("id")
            .eq("document_id", lesson["document_id"])
            .eq("status", "queued")
            .execute()
        ).data
        if not remaining:
            supabase.table("documents").update({"status": "ready"}).eq(
                "id", lesson["document_id"]
            ).execute()

    return len(lessons)


def main():
    print("Worker started. Polling for queued lessons…")
    while True:
        try:
            d = process_pending_documents()
            n = process_pending_lessons()
            if n == 0 and d == 0:
                time.sleep(5)
        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except Exception as e:
            print(f"[worker] error: {e}")
            time.sleep(10)


def health_server():
    port = int(os.environ.get("PORT", 10000))

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"ok")

        def do_HEAD(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()

        def log_message(self, format, *args):
            pass

    HTTPServer(("0.0.0.0", port), Handler).serve_forever()


if __name__ == "__main__":
    threading.Thread(target=health_server, daemon=True).start()
    main()
