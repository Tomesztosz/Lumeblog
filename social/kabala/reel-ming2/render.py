#!/usr/bin/env python3
"""„The Borrower" Reel: kulcskockák vagy teljes render hanggal.

  python social/kabala/reel-ming2/render.py --stills 1.2 6 15 20.5 31 37.5 41
  python social/kabala/reel-ming2/render.py
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = ROOT / 'output' / 'kabala' / 'reel-borrower'
TL = json.loads((HERE / 'hang' / 'timeline.json').read_text())
SR, FPS = 48000, 30


def open_page(p):
    b = p.chromium.launch()
    page = b.new_page(viewport={'width': 1080, 'height': 1920})
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto((HERE / 'reel.html').as_uri())
    page.wait_for_function('window.READY === true', timeout=30000)
    ev = page.evaluate(f'window.setTL({json.dumps(TL)})')
    return b, page, errs, ev


def stills(ts):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b, page, errs, ev = open_page(p)
        for t in ts:
            page.evaluate(f'window.frame({t})')
            page.screenshot(path=str(OUT / f'still-{t:05.2f}.png'))
        b.close()
    if errs: raise SystemExit('\n'.join(errs))
    print(ev)


def load_switch():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(HERE / 'hang' / 'switch.mp3'), '-af', 'highpass=f=90', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    sw = np.frombuffer(raw, np.float32).astype(float)
    on = int(np.argmax(np.abs(sw) > np.abs(sw).max() * .2))
    sw = sw[max(0, on - int(.004 * SR)):]
    return sw / np.abs(sw).max()


def audio(ev, dur):
    mix = np.zeros(int(dur * SR) + SR)
    rng = np.random.default_rng(5)
    def put(sig, at, g=1.0):
        i = int(at * SR)
        if i < 0: sig, i = sig[-i:], 0
        n = min(len(sig), len(mix) - i); mix[i:i + n] += sig[:n] * g
    def env(n, a, d):
        t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
    # beszéd
    for l in TL['lines']:
        a, sr = sf.read(HERE / 'hang' / f"{l['id']}.wav"); a = a if a.ndim == 1 else a.mean(1)
        put(a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * .1, l['start'])
    # léptek: tompa koppanás + bőrtalp-surrogás
    for i, t in enumerate(ev['steps']):
        n = int(.18 * SR); tt = np.arange(n) / SR
        thump = np.sin(2 * np.pi * (95 - 40 * tt / .18) * tt) * env(n, .002, .035)
        scuff = np.convolve(rng.standard_normal(n), np.ones(12) / 12, 'same') * env(n, .004, .03)
        put(thump * .5 + scuff * .35, t, .55 + .1 * (i % 2))
    # diaváltás: a kapcsoló halkan, magasabbra húzva (vetítő-kattanás)
    sw = load_switch()
    clk = np.interp(np.arange(0, len(sw), 1.35), np.arange(len(sw)), sw)
    for t in ev['slides']: put(clk, t - .02, .32)
    # fényképezőgép-zár a villanásra
    n = int(.12 * SR); sh = rng.standard_normal(n) * env(n, .001, .012); sh2 = rng.standard_normal(n) * env(n, .001, .01)
    put(np.diff(sh, prepend=0) * .6, ev['flash'] - .03); put(np.diff(sh2, prepend=0) * .5, ev['flash'] + .06)
    # a nagy kattanás: lámpa le
    put(sw * .75, ev['click'] - .004)
    # halk órakettyegés alapnak, 4 Hz, a lámpa leoltása után felerősödik
    tick_n = int(.03 * SR); tt = np.arange(tick_n) / SR
    tk = np.sin(2 * np.pi * 3100 * tt) * env(tick_n, .0005, .004) + np.sin(2 * np.pi * 5200 * tt) * env(tick_n, .0003, .002) * .5
    t = .4; i = 0
    while t < dur - .2:
        g = (.05 if t < ev['click'] else .11) * (1 if i % 2 == 0 else .7)
        put(tk, t, g); t += .25; i += 1
    # szobazaj
    room = rng.standard_normal(len(mix)); R = np.fft.rfft(room); f = np.fft.rfftfreq(len(room), 1 / SR)
    R /= np.maximum(f, 60); room = np.fft.irfft(R, len(room)); room = room / np.abs(room).max() * .01
    mix += room
    mix = mix[:int(dur * SR)]
    mix = np.tanh(mix / .7) * .7
    p = OUT / 'hang.wav'; sf.write(p, mix.astype(np.float32), SR); return p


def full():
    OUT.mkdir(parents=True, exist_ok=True)
    dur = TL['end']; n = int(round(dur * FPS))
    vid = OUT / '_kep.tmp.mp4'
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', str(vid)], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b, page, errs, ev = open_page(p)
        for i in range(n):
            page.evaluate(f'window.frame({i / FPS})')
            ff.stdin.write(page.screenshot(type='jpeg', quality=92))
            if i % 150 == 0: print(f'{i}/{n}', flush=True)
        b.close()
    ff.stdin.close(); assert ff.wait() == 0
    if errs: raise SystemExit('\n'.join(errs[:5]))
    a = audio(ev, dur)
    final = OUT / 'lume-reel-the-borrower.mp4'; tmp = OUT / '_final.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(vid), '-i', str(a), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', str(tmp)], check=True)
    tmp.rename(final); vid.unlink(); print(final)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--stills': stills([float(x) for x in sys.argv[2:]])
    else: full()
