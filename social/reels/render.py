#!/usr/bin/env python3
"""Lume Reel renderer.

  python social/reels/render.py tourbillon --stills 1.5 6 11 15.5 20
  python social/reels/render.py tourbillon            # teljes videó

A jelenet (social/reels/<név>/scene.html) determinisztikus: render(i) mindig
ugyanazt a képkockát rajzolja. A hangot a jelenet saját billegő-ütemeiből a
sound.py szintetizálja, az FFmpeg fűzi össze. Kimenet: output/reels/<név>/.
"""
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from sound import SWITCHES, export_switch, synth  # noqa: E402


def open_scene(p, name):
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto((ROOT / 'social' / 'reels' / name / 'scene.html').as_uri())
    page.wait_for_function('window.READY === true', timeout=60000)
    if errors:
        raise SystemExit('Hiba a jelenetben:\n' + '\n'.join(errors))
    return browser, page


def stills(name, times, out):
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser, page = open_scene(p, name)
        for t in times:
            page.evaluate(f'window.renderAt({t})')
            page.screenshot(path=str(out / f'still-{t:05.2f}.png'))
        browser.close()


def video(name, out, switch='billeno', audio_only=False, suffix=''):
    frames = out / 'frames'
    start = time.time()
    if audio_only:
        meta = json.loads((out / 'meta.json').read_text())
        return mux(name, out, frames, meta, switch, suffix, start)
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir(parents=True)
    with sync_playwright() as p:
        browser, page = open_scene(p, name)
        meta = page.evaluate('window.REEL')
        n = meta['N']
        for i in range(n):
            page.evaluate(f'window.render({i})')
            page.screenshot(path=str(frames / f'{i:05d}.jpg'), type='jpeg', quality=94)
            if i % 60 == 0:
                print(f'  képkocka {i}/{n}  ({time.time() - start:.0f} mp)', flush=True)
        page.evaluate(f'window.renderAt({meta.get("cover", 15.6)})')
        page.screenshot(path=str(out / 'cover.jpg'), type='jpeg', quality=95)
        browser.close()
    (out / 'meta.json').write_text(json.dumps(meta))
    return mux(name, out, frames, meta, switch, suffix, start)


def mux(name, out, frames, meta, switch, suffix, start):
    """A kész képkockákhoz új hangot készít és összefűzi; újrarenderelés nélkül."""
    synth(meta, out / 'audio.wav', switch)
    mp4 = out / f'lume-{name}-reel{suffix}.mp4'
    subprocess.run([
        'ffmpeg', '-y', '-loglevel', 'error',
        '-framerate', str(meta['FPS']), '-i', str(frames / '%05d.jpg'),
        '-i', str(out / 'audio.wav'),
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p',
        '-profile:v', 'high', '-r', str(meta['FPS']),
        '-af', 'lowpass=f=15000:poles=2',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
        '-shortest', '-movflags', '+faststart', str(mp4),
    ], check=True)
    print(f'kész: {mp4}  ({time.time() - start:.0f} mp)')
    return mp4


if __name__ == '__main__':
    name = sys.argv[1]
    out = ROOT / 'output' / 'reels' / name
    switch = sys.argv[sys.argv.index('--switch') + 1] if '--switch' in sys.argv else 'billeno'
    if '--switches' in sys.argv:
        # mindhárom kapcsolóhang külön fájlban, magában és a Reel lámpa le részletében
        for sw in SWITCHES:
            export_switch(sw, out / f'lume-kapcsolo-{sw}.wav')
            mp4 = video(name, out, sw, audio_only=True, suffix=f'-{sw}')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '11.6', '-t', '6',
                            '-i', str(mp4), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
                            '-c:a', 'aac', '-b:a', '192k', str(out / f'reszlet-{sw}.mp4')], check=True)
    elif '--stills' in sys.argv:
        stills(name, [float(x) for x in sys.argv[sys.argv.index('--stills') + 1:]], out)
    else:
        video(name, out, switch, audio_only='--audio-only' in sys.argv)
