#!/usr/bin/env python3
"""„The Borrower" 3D Reel renderelése.
  python render.py --stills 1 7 20 30 44 46 50 55   # kulcskockák
  python render.py                                    # teljes videó hanggal
Kimenet: output/kabala/borrower3d/"""
import json, socket, subprocess, sys, time
from pathlib import Path
import numpy as np, soundfile as sf
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent; KAB = HERE.parent; ROOT = HERE.parents[2]
OUT = ROOT / 'output' / 'kabala' / 'borrower3d'
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
TL = json.loads((HERE / 'timeline.json').read_text())
FPS, SR = 30, 48000
QS = ''


def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    p = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '-d', str(KAB)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(.6); return p, port


def page_ctx(p, port):
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(f'http://127.0.0.1:{port}/borrower3d/index.html' + QS)
    try: pg.wait_for_function('window.READY === true', timeout=120000)
    except Exception: raise SystemExit('\n'.join(errs) or 'nem töltött be')
    return b, pg, errs


def grab(pg):
    import base64
    d = pg.evaluate("document.getElementById('c').toDataURL('image/jpeg', .95)")
    return base64.b64decode(d.split(',', 1)[1])


def stills(ts):
    OUT.mkdir(parents=True, exist_ok=True); srv, port = serve()
    try:
        with sync_playwright() as p:
            b, pg, errs = page_ctx(p, port)
            for t in ts:
                t0 = time.time(); pg.evaluate(f'window.frame({t})'); (OUT / f'still-{t:05.2f}.jpg').write_bytes(grab(pg))
                print(f'{t:6.2f}  {time.time() - t0:.2f} mp')
            print(pg.evaluate('window.EVENTS')); b.close()
            if errs: print('\n'.join(errs[:5]))
    finally: srv.terminate()


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)


def audio(ev, dur):
    mix = np.zeros(int((dur + 1) * SR)); rng = np.random.default_rng(4)
    def put(sig, at, g=1.0):
        i = int(at * SR)
        if i < 0: sig, i = sig[-i:], 0
        n = min(len(sig), len(mix) - i); mix[i:i + n] += sig[:n] * g
    def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
    for l in TL['lines']:
        a, _ = sf.read(HERE / 'hang' / f"{l['id']}.wav"); a = a if a.ndim == 1 else a.mean(1)
        put(a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * .1, l['start'])
    sfx = HERE / 'hang' / 'sfx'
    def s(name): p = sfx / f'{name}.mp3'; return load(p) if p.exists() else None
    sw = load(KAB / 'reel-ming' / 'hang' / 'switch.mp3'); on = int(np.argmax(np.abs(sw) > np.abs(sw).max() * .2)); sw = sw[max(0, on - 200):]; sw /= np.abs(sw).max()
    put(sw * .8, ev['click'] - .004)
    for name, at, g in [('tag', ev['tagDrop'], .35), ('pop', ev['dotIn'], .3), ('shutter', ev['flash'] - .05, .45), ('whoosh', ev['click'] + 1.2, .18)]:
        x = s(name)
        if x is not None: put(x / (np.abs(x).max() + 1e-9), at, g)
    slide = s('slide')
    for t in ev['slides']:
        if slide is not None: put(slide / (np.abs(slide).max() + 1e-9), t - .03, .22)
    # órakettyegés: halk alap, lámpa le után erősebb
    n = int(.03 * SR); tt = np.arange(n) / SR
    tk = np.sin(2 * np.pi * 3100 * tt) * env(n, .0005, .004) + np.sin(2 * np.pi * 5200 * tt) * env(n, .0003, .002) * .5
    t, i = .3, 0
    while t < dur:
        put(tk, t, (.035 if t < ev['click'] else .09) * (1 if i % 2 == 0 else .7)); t += .25; i += 1
    room = s('room')
    if room is not None:
        room = np.tile(room, int(len(mix) / len(room)) + 1)[:len(mix)]; room = room / (np.abs(room).max() + 1e-9) * .03
        k = np.ones(len(mix)); k[int(ev['click'] * SR):] = .4; mix += room * k
    mix = mix[:int(dur * SR)]; mix = np.tanh(mix / .7) * .7
    p = OUT / 'hang.wav'; sf.write(p, mix.astype(np.float32), SR); return p


def ass_time(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def make_ass(click):
    """Feliratok szavanként kivilágosodva (karaoke), a hangsúlyos szavak színesek."""
    hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,LumeCaption,64,&H00F4F1E9,&H9AF4F1E9,&H00191C17,&H64191C17,0,0,0,0,100,100,0,0,1,5,2,2,90,90,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    def col(hexrgb):  # #RRGGBB -> &HBBGGRR&
        r, g, b = hexrgb[1:3], hexrgb[3:5], hexrgb[5:7]; return f"&H{b}{g}{r}&".upper()
    ev = []
    for l in TL['lines']:
        chunks, cur = [], []
        for w in l['words']:
            cur.append(w)
            if w[0][-1:] in '.?!': chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for ci, ch in enumerate(chunks):
            start = ch[0][1] - .06
            end = chunks[ci + 1][0][1] - .06 if ci + 1 < len(chunks) else l['start'] + l['dur'] + .25
            night = start >= click
            base = '#E6F3B0' if l['who'] == 'dot' else '#F4F1E9'
            emp = '#D7EB96' if night else '#FFD27A'
            txt = '{\\k%d}' % max(1, int(round((ch[0][1] - start) * 100)))
            for wi, (w, a, b, e) in enumerate(ch):
                nxt = ch[wi + 1][1] if wi + 1 < len(ch) else b
                k = max(1, int(round((nxt - a) * 100)))
                txt += '{\\k%d}' % k + ('{\\1c%s}%s{\\1c%s}' % (col(emp), w, col(base)) if e else w) + ' '
            ev.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Cap,,0,0,0,,{{\\1c{col(base)}\\fad(60,60)}}{txt.strip()}")
    p = OUT / 'captions.ass'; p.write_text(hdr + '\n'.join(ev) + '\n', encoding='utf-8'); return p


def make_endcard(pg):
    p = OUT / 'endcard.png'
    pg.evaluate("document.getElementById('c').style.visibility='hidden'; document.body.style.background='transparent'; document.getElementById('wrap').style.background='transparent'; const e=document.getElementById('endcard'); e.style.opacity=1; e.style.transform='none';")
    pg.locator('#wrap').screenshot(path=str(p), omit_background=True)
    pg.evaluate("document.getElementById('c').style.visibility='visible'; document.getElementById('endcard').style.opacity=0;")
    return p


def full(t_from=0.0, t_to=None, name='lume-the-borrower-3d.mp4'):
    OUT.mkdir(parents=True, exist_ok=True); srv, port = serve()
    dur = TL['end']; t_to = t_to or dur
    i0, i1 = int(round(t_from * FPS)), int(round(t_to * FPS)); vid = OUT / f'_kep-{i0}.tmp.mp4'
    try:
        with sync_playwright() as p:
            b, pg, errs = page_ctx(p, port); ev = pg.evaluate('window.EVENTS')
            ass, endc = make_ass(ev['click']), make_endcard(pg)
            end_t = ev['end'] - 2.2
            fonts = HERE / 'fonts'
            vf = (f"[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.45,setpts=PTS+{t_from}/TB,subtitles={ass}:fontsdir={fonts},setpts=PTS-{t_from}/TB[v];"
                  f"[1:v]format=rgba,fade=in:st={max(0, end_t - t_from):.3f}:d=0.6:alpha=1[e];[v][e]overlay=0:0:shortest=1,format=yuv420p")
            ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                                   '-loop', '1', '-framerate', str(FPS), '-i', str(endc), '-filter_complex', vf,
                                   '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-r', str(FPS), str(vid)], stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(i0, i1):
                pg.evaluate(f'window.frame({i / FPS})'); ff.stdin.write(grab(pg))
                if (i - i0) % 90 == 0: print(f'{i}/{i1}  {time.time() - t0:.0f} mp', flush=True)
            b.close()
    finally: srv.terminate()
    ff.stdin.close(); assert ff.wait() == 0
    if t_from > 0 or t_to < dur:
        final = OUT / name; vid.rename(final); print(final); return
    if errs: print('\n'.join(errs[:5]))
    a = audio(ev, dur)
    final = OUT / 'lume-the-borrower-3d.mp4'; tmp = OUT / '_final.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(vid), '-i', str(a), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', str(tmp)], check=True)
    tmp.rename(final); vid.unlink(); print(final)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--stills': stills([float(x) for x in sys.argv[2:]])
    elif len(sys.argv) > 1 and sys.argv[1] == '--audio':
        srv, port = serve()
        with sync_playwright() as p: b, pg, errs = page_ctx(p, port); ev = pg.evaluate('window.EVENTS'); b.close()
        srv.terminate(); print(audio(ev, TL['end']))
    elif len(sys.argv) > 1 and sys.argv[1] == '--clip': full(float(sys.argv[2]), float(sys.argv[3]), f'proba-{sys.argv[2]}-{sys.argv[3]}.mp4')
    else: full()
