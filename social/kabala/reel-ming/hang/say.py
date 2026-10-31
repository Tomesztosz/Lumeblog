import sys, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
def say(text, voice, speed, out):
    a, sr = k.create(text, voice=voice, speed=speed, lang='en-gb' if voice.startswith('b') else 'en-us')
    sf.write(out, a, sr); return len(a)/sr
if __name__ == '__main__':
    print(say(sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]))
