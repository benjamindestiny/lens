import soundfile as sf
from kokoro_onnx import Kokoro

kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")

text = (
    "You know how every new phone feels like a whole new world? "
    "Computers have gone through the same kind of leap, five times over. "
    "Let's walk through those five generations and see what changed each time. "
    "The first generation was built around vacuum tubes. Those glass bulbs "
    "glowed orange and got really hot. They made the early machines huge and "
    "power-hungry, but they could finally do calculations that were previously "
    "impossible by hand."
)

for speed in [0.9, 0.85]:
    for voice in ["af_heart", "am_michael"]:
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
        name = f"test-{voice}-{speed}.wav"
        sf.write(name, samples, sr)
        print(f"wrote {name} ({len(samples)/sr:.1f}s)")
