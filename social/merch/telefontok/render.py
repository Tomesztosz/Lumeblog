#!/usr/bin/env python3
"""Lume telefontok: látványtervek, nyomdai fájlok és vonalvastagság-ellenőrzés.

  python social/merch/telefontok/render.py

Kimenet: output/merch/telefontok/
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'output' / 'merch' / 'telefontok'
PAGE = Path(__file__).resolve().parent / 'tok.html'

# terv → ajánlott tokszín és a felirat tónusa
PAIRS = [
    ('nagy', 'beige', 'light'),
    ('fuggoleges', 'olive', 'dark'),
    ('kicsi', 'beige', 'light'),
    ('motto', 'white', 'light'),
    ('sarok', 'grey', 'light'),
    ('ritkitott', 'black', 'dark'),
]
COLORWAYS = [('beige', 'light'), ('olive', 'dark'), ('black', 'dark'), ('navy', 'dark')]
MIN_LINE_MM = 0.7
# A mottóban csak az ékezetek (Ó, Á, Ő) maradnak 0,7 mm alatt: rövid, elvékonyodó
# jelek, rajtuk a vastagítás nem segít, csak elmaszatolná a feliratot.
THICK_OVERRIDE = {'motto': 0.10}


def shot(page, fn, args, path, transparent):
    page.evaluate(f'window.{fn}(...{json.dumps(args)})')
    svg = page.locator('#s')
    svg.screenshot(path=str(path), omit_background=transparent)


def thin_check(png, px_per_mm):
    """Megkeresi a 0,7 mm-nél vékonyabb részeket: ami egy 0,7 mm-es koronggal
    végzett nyitás után eltűnik, az túl vékony a nyomtatáshoz."""
    a = np.asarray(Image.open(png))[..., 3] > 127
    r = int(round(MIN_LINE_MM * px_per_mm / 2))
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    disk = xx ** 2 + yy ** 2 <= r * r
    opened = ndimage.binary_opening(a, structure=disk)
    lost = a & ~opened
    # a sarkok lekerekítése mindig veszít egy keveset; a hosszú vékony szakasz a gond
    lab, n = ndimage.label(lost)
    sizes = ndimage.sum(lost, lab, range(1, n + 1)) if n else []
    worst = float(max(sizes)) / (px_per_mm ** 2) if n else 0.0
    return float(lost.sum() / max(a.sum(), 1)), worst, lost


def crop_png(src, dst, pad_px):
    im = Image.open(src)
    box = im.getchannel('A').getbbox()
    l, t, r, b = box
    im.crop((max(0, l - pad_px), max(0, t - pad_px), min(im.width, r + pad_px), min(im.height, b + pad_px))).save(dst)


def sheet(page, tiles, cols, path, title, tile_w):
    """Összesítő lap a márka betűivel, böngészőben renderelve."""
    nm = (ROOT / 'node_modules').as_uri()
    cells = ''.join(
        f'<figure><img src="{Path(src).as_uri()}"><figcaption><b>{label}</b><span>{sub}</span></figcaption></figure>'
        for src, label, sub in tiles)
    html = f"""<!doctype html><meta charset="utf-8"><style>
@font-face {{ font-family: Hanken; font-weight: 100 900; src: url('{nm}/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2'); }}
@font-face {{ font-family: Hanken; font-weight: 100 900; unicode-range: U+0100-024F;
  src: url('{nm}/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-ext-wght-normal.woff2'); }}
@font-face {{ font-family: Fr; font-weight: 100 900; src: url('{nm}/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2'); }}
@font-face {{ font-family: Fr; font-weight: 100 900; unicode-range: U+0100-024F;
  src: url('{nm}/@fontsource-variable/fraunces/files/fraunces-latin-ext-opsz-normal.woff2'); }}
@font-face {{ font-family: Mono; src: url('{nm}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'); }}
@font-face {{ font-family: Mono; unicode-range: U+0100-024F; src: url('{nm}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2'); }}
body {{ margin: 0; background: #f2f0e8; color: #242722; font-family: Hanken; width: max-content; padding: 56px 64px 40px; }}
h1 {{ font: 500 54px/1.1 Fr; letter-spacing: -0.03em; margin: 0 0 44px; }}
.g {{ display: grid; grid-template-columns: repeat({cols}, {tile_w}px); gap: 40px 48px; }}
figure {{ margin: 0; }} img {{ width: {tile_w}px; display: block; }}
figcaption {{ padding: 6px 8px 0; }} b {{ display: block; font-weight: 600; font-size: {max(20, tile_w // 16)}px; }}
span {{ display: block; font: {max(14, tile_w // 26)}px/1.4 Mono; color: #61655b; margin-top: 4px; }}
</style><h1>{title}</h1><div class="g">{cells}</div>"""
    tmp = OUT / '_lap.html'
    tmp.write_text(html, encoding='utf-8')
    page.goto(tmp.as_uri())
    page.evaluate('document.fonts.ready')
    page.wait_for_timeout(300)
    page.locator('body').screenshot(path=str(path))
    tmp.unlink()


def find_thickness(page, d, ppm):
    """A legkisebb vastagítás (mm), amellyel nincs 0,7 mm-nél vékonyabb rész."""
    probe = OUT / '_probe.png'
    for th in [round(x * 0.05, 2) for x in range(0, 13)]:
        shot(page, 'printFile', [d, 'light', th], probe, True)
        ratio, worst, lost = thin_check(probe, ppm)
        if worst <= 0.5:
            probe.unlink()
            return th, ratio, worst
    probe.unlink()
    return th, ratio, worst


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'nyomdai').mkdir(exist_ok=True)
    (OUT / 'latvany').mkdir(exist_ok=True)
    report = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(PAGE.as_uri())
        page.wait_for_function('window.READY === true', timeout=30000)
        meta = page.evaluate('window.DESIGNS_META')
        cases = page.evaluate('window.CASES_META')
        ppm = page.evaluate('window.PX_PER_MM')

        thick = {}
        for d, _, _ in PAIRS:
            if d in THICK_OVERRIDE:
                th = THICK_OVERRIDE[d]
                probe = OUT / '_probe.png'
                shot(page, 'printFile', [d, 'light', th], probe, True)
                ratio, worst, _ = thin_check(probe, ppm)
                probe.unlink()
            else:
                th, ratio, worst = find_thickness(page, d, ppm)
            thick[d] = th
            report.append((d, th, ratio, worst))

        tiles = []
        for i, (d, case, tone) in enumerate(PAIRS, 1):
            m = OUT / 'latvany' / f'{i:02d}-{d}-{case}.png'
            shot(page, 'mockup', [d, case, tone, thick[d]], m, True)
            tiles.append((m, f'{i}. {meta[d]["title"]}', f'{cases[case]["name"]} tok · {meta[d]["note"]}'))

        cw = []
        for i, (d, _, _) in enumerate(PAIRS, 1):
            for case, tone in COLORWAYS:
                m = OUT / 'latvany' / f'szin-{i:02d}-{d}-{case}.png'
                shot(page, 'mockup', [d, case, tone, thick[d]], m, True)
                cw.append((m, f'{i}. {meta[d]["title"]}', cases[case]['name']))

        for i, (d, _, _) in enumerate(PAIRS, 1):
            for tone, name in (('light', 'sotet-felirat'), ('dark', 'vilagos-felirat')):
                full = OUT / 'nyomdai' / f'{i:02d}-{d}-{name}-teljes-tok.png'
                shot(page, 'printFile', [d, tone, thick[d]], full, True)
                crop_png(full, OUT / 'nyomdai' / f'{i:02d}-{d}-{name}.png', int(2 * ppm))

        sheet(page, tiles, 3, OUT / 'opciok.png', 'Lume telefontok · iPhone 16 Pro', 600)
        sheet(page, cw, 8, OUT / 'szinek.png', 'Ugyanezek más tokszínen', 300)
        b.close()
        if errors:
            raise SystemExit('\n'.join(errors))

    print('vonalvastagság (0,7 mm alatti részek, a szükséges vastagítással):')
    for d, th, ratio, worst in report:
        flag = 'RENDBEN' if worst <= 0.5 else ('ÉKEZETEK' if d in THICK_OVERRIDE else 'VÉKONY')
        print(f'  {d:12s} vastagítás {th:.2f} mm | {ratio * 100:5.2f}% | legnagyobb vékony rész {worst:.2f} mm²  {flag}')
    (OUT / 'vastagitas.json').write_text(json.dumps({d: th for d, th, _, _ in report}, indent=2))


if __name__ == '__main__':
    main()
