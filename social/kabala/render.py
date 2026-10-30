#!/usr/bin/env python3
"""Lume kabalák: jelenetek és arckifejezés-sorok renderelése.

  python social/kabala/render.py            # minden jelenet
  python social/kabala/render.py tenten-1   # csak a névre illők

Kimenet: output/kabala/ (2x felbontás)
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'kabala'
PAGE = Path(__file__).resolve().parent / 'cast.html'


def main(filt=None):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(device_scale_factor=2, viewport={'width': 2400, 'height': 1400})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(PAGE.as_uri())
        page.wait_for_function('window.READY === true', timeout=30000)
        for name in page.evaluate('window.SCENES_META'):
            if filt and filt not in name:
                continue
            page.evaluate(f'window.render({name!r})')
            page.wait_for_timeout(50)
            page.locator('#s').screenshot(path=str(OUT / f'{name}.png'))
            print(name)
        b.close()
    if errors:
        raise SystemExit('\n'.join(errors))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else None)
