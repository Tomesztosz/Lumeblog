#!/usr/bin/env python3
"""MING-pilot Reel: képkockák a böngészőből, hang keverése, MP4.

  python social/kabala/reel-ming/render_reel.py --stills 0.8 3 7.5 12.5 15.5
  python social/kabala/reel-ming/render_reel.py
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = ROOT / 'output' / 'kabala' / 'reel-ming'
TL = json.loads((HERE / 'hang' / 'timeline.json').read_text())
SR = 48000


def open_page(p):
    b = p.chromium.launch()
    page = b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto((HERE / 'reel.html').as_uri())
    page.wait_for_function('window.READY === true', timeout=30000)
    page.evaluate(f'window.setTL({json.dumps(TL)})')
    return b, page, errs


def stills(ts):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b, page, errs = open_page(p)
        for t in ts:
            page.evaluate(f'window.frame({t})')
            page.locator('#s').screenshot(path=str(OUT / f'still-{t:05.2f}.png'))
        b.close()
    if errs: raise SystemExit('\n'.join(errs))


def audio(dur):
    mix = np.zeros(int(dur * SR))
    def put(sig, at, gain=1.0):
        i = int(at * SR); n = min(len(sig), len(mix) - i); mix[i:i + n] += sig[:n] * gain
    for l in TL['lines']:
        a, sr = sf.read(HERE / 'hang' / f"{l['id']}.wav"); a = a if a.ndim == 1 else a.mean(1)
        a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * .09
        put(a, l['start'])
    # a kapcsoló: a Lume saját kattanása
    sw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(HERE / 'hang' / 'switch.mp3'), '-af', 'highpass=f=90', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                        capture_output=True, check=True).stdout
    sw = np.frombuffer(sw, np.float32).astype(float)
    on = np.argmax(np.abs(sw) > np.abs(sw).max() * .2)
    sw = sw[max(0, on - int(.004 * SR)):]
    sw = sw / np.abs(sw).max() * .7
    put(sw, TL['click'] - .004)
    put(sw * .55, 18.1)
    # halk, sötét alapzaj a kattanás után: a „szoba hangja"
    rng = np.random.default_rng(3); room = rng.standard_normal(len(mix))
    from numpy.fft import rfft, irfft
    f = np.fft.rfftfreq(len(room), 1 / SR); R = rfft(room); R *= 1 / np.maximum(f, 40) ** 1.0; room = irfft(R, len(room))
    room = room / np.abs(room).max() * .012
    room[: int(TL['click'] * SR)] *= .25
    mix += room
    mix = np.tanh(mix / .7) * .7
    p = OUT / 'hang.wav'; sf.write(p, mix.astype(np.float32), SR)
    return p


def full():
    OUT.mkdir(parents=True, exist_ok=True)
    dur = 18.6; n = int(dur * 30)
    vid = OUT / '_kep.tmp.mp4'
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', str(vid)], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b, page, errs = open_page(p)
        for i in range(n):
            page.evaluate(f'window.frame({i / 30})')
            ff.stdin.write(page.screenshot(type='jpeg', quality=92))
        b.close()
    ff.stdin.close(); assert ff.wait() == 0
    if errs: raise SystemExit('\n'.join(errs))
    a = audio(dur)
    final = OUT / 'lume-reel-ming-pilot.mp4'
    tmp = OUT / '_final.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(vid), '-i', str(a), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', str(tmp)], check=True)
    tmp.rename(final); vid.unlink()
    print(final)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--stills':
        stills([float(x) for x in sys.argv[2:]])
    else:
        full()
