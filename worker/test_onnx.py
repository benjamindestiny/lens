import soundfile as sf
from kokoro_onnx import Kokoro

kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
samples, sample_rate = kokoro.create(
    "You know how every new phone feels like a whole new world? "
    "Computers have gone through the same kind of leap, five times over.",
    voice="af_heart",
    speed=1.0,
    lang="en-us",
)
sf.write("test-onnx.wav", samples, sample_rate)
print("wrote test-onnx.wav")
