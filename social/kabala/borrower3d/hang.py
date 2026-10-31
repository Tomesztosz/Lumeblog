#!/usr/bin/env python3
"""A forgatókönyv sorait legenerálja ElevenLabsszel (időbélyegekkel), és idővonalat épít:
mikor szól melyik sor, szájmozgás (nyitás + szélesség) kockánként, szavak ideje a felirathoz.
  python hang.py          # csak a hiányzó sorokat generálja
  python hang.py --force  # mindet újra"""
import base64, json, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hang'))
import eleven

FPS = 30
S = json.loads((HERE / 'script.json').read_text())
OUT = HERE / 'hang'; OUT.mkdir(exist_ok=True)
force = '--force' in sys.argv

def gen(line):
    mp3, al = OUT / f"{line['id']}.mp3", OUT / f"{line['id']}.align.json"
    if mp3.exists() and al.exists() and not force: return
    body = {'text': line['text'], 'model_id': eleven.ENV.get('ELEVENLABS_MODEL') or 'eleven_v3',
            'voice_settings': {'speed': 1.12 if line['who'] == 'TEN-TEN' else 1.08}}
    raw = eleven.api(f"/v1/text-to-speech/{eleven.voice_for(line['who'])}/with-timestamps?output_format=mp3_44100_192", body)
    j = json.loads(raw)
    mp3.write_bytes(base64.b64decode(j['audio_base64']))
    al.write_text(json.dumps(j.get('alignment') or j.get('normalized_alignment')))
    print('generálva', line['id'])

def words_from(al, text, caption_map):
    chars, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    # a [jelek] kimaradnak; szavak a szóközök mentén
    out, cur, t0, inb = [], '', None, False
    for c, a, b in zip(chars, st, en):
        if c == '[': inb = True; continue
        if c == ']': inb = False; continue
        if inb: continue
        if c.isspace():
            if cur: out.append([cur, t0, b]); cur = ''
            continue
        if not cur: t0 = a
        cur += c; tb = b
    if cur: out.append([cur, t0, tb])
    out = [w for w in out if w[0].strip('.')]
    # felirat-csere (pl. számok): az érintett szavak összevonása
    for src, dst in caption_map.items():
        sw = src.split()
        for i in range(len(out) - len(sw) + 1):
            if [w[0] for w in out[i:i + len(sw)]] == sw:
                out[i:i + len(sw)] = [[d, out[i][1], out[i + len(sw) - 1][2]] for d in dst.split()][:1] + \
                    [[d, out[i][1], out[i + len(sw) - 1][2]] for d in dst.split()][1:]
                break
    return out

def tighten(path):
    """Levágja a sor eleji/végi csendet, a belső szüneteket 0,22 mp-re rövidíti.
    Visszaadja a hangot és az eredeti → új idő leképezést."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).astype(float); sr = 48000; hop = 480
    rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a), hop)])
    loud = rms > 10 ** (-40 / 20)
    idx = np.where(loud)[0]
    first, last = (idx[0], idx[-1]) if len(idx) else (0, len(rms) - 1)
    keep = np.zeros(len(rms), bool); keep[max(0, first - 3):min(len(rms), last + 8)] = True
    i = first
    while i <= last:
        if not loud[i]:
            j = i
            while j <= last and not loud[j]: j += 1
            if (j - i) * hop / sr > .3:
                k = int(.22 * sr / hop); m = (i + j) // 2
                keep[m - (j - i) // 2 + k // 2: m + (j - i) // 2 - k // 2] = False
            i = j
        else: i += 1
    cum = np.cumsum(keep) * hop / sr
    def tmap(t):
        f = min(len(cum) - 1, max(0, int(t * sr / hop))); return float(cum[f])
    out = np.concatenate([a[f * hop:(f + 1) * hop] for f in range(len(rms)) if keep[f]])
    # apró átúszás a vágások helyén helyett rövid ki-be úsztatás elég, mert csendben vágunk
    sf.write(path.with_suffix('.wav'), out.astype(np.float32), sr)
    return out, tmap

def analyse(path, a=None):
    sr = 48000
    n = int(len(a) / sr * FPS) + 1; env, cen = [], []
    for i in range(n):
        s = a[int(i / FPS * sr):int((i + 1) / FPS * sr)]
        if len(s) < 64: env.append(0); cen.append(0); continue
        env.append(float(np.sqrt(np.mean(s ** 2))))
        sp = np.abs(np.fft.rfft(s * np.hanning(len(s)))); f = np.fft.rfftfreq(len(s), 1 / sr)
        cen.append(float((sp * f).sum() / (sp.sum() + 1e-9)))
    m = max(env) or 1
    o = [min(1, (e / m) ** .7 * 1.15) for e in env]
    # simítás: a száj ne vibráljon
    o = list(np.convolve(o, [.25, .5, .25], 'same'))
    cs = [c for c, e in zip(cen, o) if e > .2] or [1]; lo, hi = np.percentile(cs, 15), np.percentile(cs, 85)
    w = [float(np.clip((c - lo) / (hi - lo + 1e-9), 0, 1)) if e > .12 else 0 for c, e in zip(cen, o)]
    return len(a) / sr, [round(x, 3) for x in o], [round(x, 3) for x in w]

t = 0.15; lines = []
for line in S['lines']:
    gen(line)
for line in S['lines']:
    al = json.loads((OUT / f"{line['id']}.align.json").read_text())
    a, tmap = tighten(OUT / f"{line['id']}.mp3")
    dur, o, w = analyse(None, a)
    ws = [[x, tmap(p), tmap(q)] for x, p, q in words_from(al, line['text'], line.get('caption', {}))]
    emph = set(line.get('emph', []))
    lines.append(dict(id=line['id'], who='dot' if line['who'] == 'DOT' else 'tenten', start=round(t, 3), dur=round(dur, 3),
                      env=o, wide=w, words=[[x, round(t + a, 3), round(t + b, 3), x in emph] for x, a, b in ws]))
    print(f"{line['id']} {line['who']:8s} {t:6.2f} → {t + dur:6.2f}  {' '.join(x for x, *_ in ws)}")
    t += dur + line.get('gap', .3)
json.dump(dict(fps=FPS, end=round(t + .6, 2), lines=lines), open(HERE / 'timeline.json', 'w'))
print('hossz', round(t + .6, 2))
