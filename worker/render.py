import json
import os
import re
import subprocess
import tempfile

REMOTION_DIR = os.path.join(os.path.dirname(__file__), "remotion")
FPS = 30


def render_lesson(title: str, points: list[str], audio_url: str, audio_seconds: float) -> bytes:
    duration_frames = max(int(audio_seconds * FPS), FPS * 5)
    props = {"title": title, "points": points, "audioUrl": audio_url, "audioSeconds": audio_seconds}

    with tempfile.TemporaryDirectory() as tmp:
        props_path = os.path.join(tmp, "props.json")
        out_path = os.path.join(tmp, "lesson.mp4")

        with open(props_path, "w") as f:
            json.dump(props, f)

        cmd = [
            "npx", "remotion", "render",
            "src/index.ts", "Lesson", out_path,
            f"--props={props_path}",
            f"--frames=0-{duration_frames - 1}",
            "--codec=h264",
            "--log=error",
        ]

        print(f"[render] rendering {duration_frames} frames ({audio_seconds:.1f}s)…")
        result = subprocess.run(
            cmd, cwd=REMOTION_DIR, capture_output=True, text=True, timeout=1200
        )
        if result.returncode != 0:
            raise RuntimeError(f"Remotion failed: {result.stderr[-800:]}")

        with open(out_path, "rb") as f:
            return f.read()


def extract_points(script: str, max_points: int = 4) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", script.strip())
    points = [s.strip() for s in sentences if 40 <= len(s.strip()) <= 200]
    return points[:max_points] or [script[:180]]
