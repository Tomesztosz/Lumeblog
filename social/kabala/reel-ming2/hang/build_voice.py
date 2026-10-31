#!/usr/bin/env python3
"""A MING-sztori hangsávjai és időzítése. Kokoro (helyi, nyílt modell) kell hozzá:
  python build_voice.py /path/to/kokoro-dir
A *csillagos* szavak a hangsúlyok: ott szemöldök és gesztus jön."""
import json, subprocess, sys, re
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).resolve().parent
KDIR = Path(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/tts')
sys.path.insert(0, str(KDIR))
import os; os.chdir(KDIR)
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')

TT = ('bm_george', 'rubberband=pitch=0.89:formant=preserved,equalizer=f=180:t=q:w=1:g=3,lowpass=f=9000,acompressor=threshold=-20dB:ratio=3:attack=5:release=80')
DOT = ('af_sky', 'rubberband=pitch=1.3,highpass=f=200')
# (azonosító, ki, kimondott szöveg, felirat, tempó, szünet előtte)
SCRIPT = [
    ('a1', 'tenten', 'This man designs watches.', 'This man *designs* watches.', .9, 2.9),
    ('a2', 'tenten', "And back then, the watches he loved were way beyond an intern's salary.", "And back then, the watches he loved were *way* beyond an intern's salary.", .93, .45),
    ('b1', 'dot', 'Then how?', 'Then *how?!*', 1.15, .25),
    ('a3', 'tenten', 'He borrowed them.', 'He *borrowed* them.', .85, .3),
    ('a4', 'tenten', 'Collectors lent him their watches. He photographed them, studied them, and gave them back.', 'Collectors lent him their watches. He *photographed* them, studied them, and gave them back.', .95, .3),
    ('a5', 'tenten', 'A collection with return dates. Financially, very sensible.', 'A collection with *return dates.* Financially, very *sensible.*', .88, .5),
    ('a6', 'tenten', 'Later, photography took him all the way to Hasselblad, as Chief of Strategy.', 'Later, photography took him all the way to *Hasselblad,* as Chief of Strategy.', .95, .55),
    ('a7', 'tenten', 'And on the eighth of August, twenty seventeen, he launched a watch of his own. The Ming seventeen oh one.', 'And on 8 August 2017, he launched a watch of his *own.* The MING 17.01.', .95, .35),
    ('b2', 'dot', 'Can we borrow one?', 'Can we *borrow* one?', 1.12, .35),
    ('a8', 'tenten', 'Lights off.', 'Lights *off.*', .85, .4),
    ('a9', 'tenten', 'Full story, on Lume.', 'Full story on *Lume.*', .9, 1.0),
]
FPS = 30
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
t = 0.0; lines = []
for lid, who, said, cap, speed, gap in SCRIPT:
    voice, fx = TT if who == 'tenten' else DOT
    a, sr = k.create(said, voice=voice, speed=speed, lang='en-gb' if voice.startswith('b') else 'en-us')
    raw = HERE / f'_{lid}.wav'; sf.write(raw, a, sr)
    out = HERE / f'{lid}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-af', f'{TRIM},{fx},aresample=48000', str(out)], check=True)
    raw.unlink()
    a, sr = sf.read(out); a = a if a.ndim == 1 else a.mean(1)
    d = len(a) / sr; t += gap
    n = int(d * FPS) + 1; env = []; wide = []
    for i in range(n):
        s = a[int(i / FPS * sr):int((i + 1) / FPS * sr)]
        if len(s) < 64: env.append(0); wide.append(0); continue
        env.append(float(np.sqrt(np.mean(s ** 2))))
        sp = np.abs(np.fft.rfft(s * np.hanning(len(s)))); f = np.fft.rfftfreq(len(s), 1 / sr)
        c = float((sp * f).sum() / (sp.sum() + 1e-9)); wide.append(c)
    m = max(env)
    env = [round(min(1, (e / m) ** .7 * 1.1), 3) for e in env]
    cs = [c for c, e in zip(wide, env) if e > .2] or [1]
    lo, hi = np.percentile(cs, 15), np.percentile(cs, 85)
    wide = [round(float(np.clip((c - lo) / (hi - lo + 1e-9), 0, 1)), 3) if e > .12 else 0 for c, e in zip(wide, env)]
    words = cap.split(); w = [len(re.sub(r'\W', '', x)) + 2 for x in words]; tot = sum(w); acc = 0; wt = []
    for x, l in zip(words, w):
        wt.append([x.replace('*', ''), round(t + d * acc / tot, 3), x.startswith('*')]); acc += l
    lines.append(dict(id=lid, who=who, start=round(t, 3), dur=round(d, 3), env=env, wide=wide, words=wt))
    print(f'{lid} {who:6s} {t:6.2f} → {t + d:6.2f}')
    t += d
json.dump(dict(fps=FPS, end=round(t + 1.6, 2), lines=lines), open(HERE / 'timeline.json', 'w'))
print('vége', round(t + 1.6, 2))
