import io
import json
import numpy as np
import onnxruntime as ort
import soundfile as sf
from huggingface_hub import hf_hub_download
from misaki import en

VOICE = "af_msa"  # Required for the distilled model
SPEED = 0.85
SAMPLE_RATE = 24000

REPO = "oddadmix/Kokoro-7M-Distill-ONNX"
_sess = None
_vocab = None
_voice = None
_g2p = None


def get_kokoro():
    global _sess, _vocab, _voice, _g2p
    if _sess is None:
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 2
        _sess = ort.InferenceSession(
            hf_hub_download(REPO, "onnx/model.onnx"),
            opts,
            providers=["CPUExecutionProvider"],
        )
        _vocab = json.load(open(hf_hub_download(REPO, "config.json")))["vocab"]
        _voice = np.fromfile(
            hf_hub_download(REPO, f"voices/{VOICE}.bin"), dtype=np.float32
        ).reshape(-1, 1, 256)
        _g2p = en.G2P(trf=False, british=False, fallback=None, unk="")
    return _sess, _vocab, _voice, _g2p


def synthesize(text: str) -> tuple[bytes, float]:
    sess, vocab, voice, g2p = get_kokoro()
    phonemes = g2p(text)[0]
    ids = [vocab[p] for p in phonemes if p in vocab][:510]

    audio = sess.run(
        None,
        {
            "input_ids": np.array([[0, *ids, 0]], dtype=np.int64),
            "style": voice[len(ids) - 1],
            "speed": np.array([SPEED], dtype=np.float32),
        },
    )[0]

    duration = len(audio) / SAMPLE_RATE
    buf = io.BytesIO()
    sf.write(buf, audio, SAMPLE_RATE, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read(), duration
