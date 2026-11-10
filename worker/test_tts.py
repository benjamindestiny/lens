import soundfile as sf
from kokoro import KPipeline

pipeline = KPipeline(lang_code="a")

text = (
    "You know how every new phone feels like a whole new world? "
    "Computers have gone through the same kind of leap, five times over."
)

for i, (gs, ps, audio) in enumerate(pipeline(text, voice="af_heart")):
    sf.write(f"test-{i}.wav", audio, 24000)
    print(f"wrote test-{i}.wav ({len(audio)} samples)")
