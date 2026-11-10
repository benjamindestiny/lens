import os
import re
import io
import wave
import numpy as np
from kokoro_onnx import Kokoro
import soundfile as sf

VOICE = "af_heart"   # change to "am_michael" if you preferred the male voice
SPEED = 0.85
SAMPLE_RATE = 24000

_kokoro = None


def get_kokoro() -> Kokoro:
    global _kokoro
    if _kokoro is None:
        _kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
    return _kokoro


def split_into_chunks(text: str, max_chars: int = 600) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks, current = [], ""
    for s in sentences:
        if len(current) + len(s) + 1 <= max_chars:
            current = f"{current} {s}".strip()
        else:
            if current:
                chunks.append(current)
            current = s
    if current:
        chunks.append(current)
    return chunks


def synthesize(script: str) -> tuple[bytes, float]:
    kokoro = get_kokoro()
    chunks = split_into_chunks(script)
    all_samples = []

    for i, chunk in enumerate(chunks):
        samples, sr = kokoro.create(
            chunk, voice=VOICE, speed=SPEED, lang="en-us"
        )
        all_samples.append(samples)
        print(f"  chunk {i + 1}/{len(chunks)}: {len(samples) / sr:.1f}s")

    audio = np.concatenate(all_samples)
    duration = len(audio) / SAMPLE_RATE

    buf = io.BytesIO()
    sf.write(buf, audio, SAMPLE_RATE, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read(), duration
