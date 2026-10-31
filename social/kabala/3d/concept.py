#!/usr/bin/env python3
"""Ten-Ten 3D látványtervek. Kimenet: output/kabala/3d/"""
import json, subprocess, sys, time, socket
from pathlib import Path
from playwright.sync_api import sync_playwright
HERE = Path(__file__).resolve().parent; ROOT = HERE.parents[2]
OUT = ROOT / 'output' / 'kabala' / '3d'
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']

def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    p = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '-d', str(HERE)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(.6); return p, port

SHOTS = {
  'a-minimal': dict(style='vinyl', face='minimal'),
  'b-mustache': dict(style='vinyl', face='mustache'),
  'c-brows': dict(style='vinyl', face='brows'),
  'd-plush': dict(style='plush', face='top'),
  'e-night': dict(style='night', face='mustache'),
}
if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    srv, port = serve()
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(args=ARGS); pg = b.new_page(viewport={'width': 1200, 'height': 1400})
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            pg.goto(f'http://127.0.0.1:{port}/concept.html'); pg.wait_for_function('window.READY === true', timeout=60000)
            shots = json.loads(sys.argv[1]) if len(sys.argv) > 1 else SHOTS
            for name, o in shots.items():
                pg.evaluate(f'window.show({json.dumps(o)})'); pg.locator('#c').screenshot(path=str(OUT / f'{name}.png')); print(name)
            b.close()
            if errs: print('\n'.join(errs))
    finally:
        srv.terminate()
