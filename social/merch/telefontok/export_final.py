#!/usr/bin/env python3
"""Egy kiválasztott terv végleges, nagy felbontású exportja.

  python social/merch/telefontok/export_final.py perem

Kimenet (output/merch/telefontok/vegleges/):
  lume-tok-<terv>-vilagos-tokra.png   1219 dpi, átlátszó, a teljes hátlap
  lume-tok-<terv>-sotet-tokra.png     ugyanez sötét tokra
  lume-tok-<terv>-*.pdf               vektoros változat, beágyazott betűkkel
  latvany-<terv>-*.png                látványterv
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render as R  # noqa: E402

HI = 48  # px/mm, kb. 1219 dpi


def main(d):
    out = R.OUT / 'vegleges'
    out.mkdir(parents=True, exist_ok=True)
    th = json.loads((R.OUT / 'vastagitas.json').read_text()).get(d, 0)
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(R.PAGE.as_uri())
        page.wait_for_function('window.READY === true', timeout=30000)

        # vonalvastagság ellenőrzése a normál felbontáson, a végleges paraméterekkel
        probe = out / '_probe.png'
        R.shot(page, 'printFile', [d, 'light', th], probe, True)
        ratio, worst, _ = R.thin_check(probe, 24)
        probe.unlink()

        for case, tone, name in (('beige', 'light', 'vilagos-tokra'), ('black', 'dark', 'sotet-tokra')):
            R.shot(page, 'mockup', [d, case, tone, th], out / f'latvany-{d}-{case}.png', True)

        page.evaluate(f'window.setScale({HI})')
        tones = (('light', 'vilagos-tokra'), ('dark', 'sotet-tokra'))
        for tone, name in tones:
            R.shot(page, 'printFile', [d, tone, th], out / f'lume-tok-{d}-{name}.png', True)
        # vektoros PDF pontosan a hátlap méretében (a képek után, mert átállítja a méretezést)
        page.add_style_tag(content='@page { size: 75mm 150mm; margin: 0 } '
                                   'svg#s { width: 75mm !important; height: 150mm !important }')
        for tone, name in tones:
            page.evaluate(f'window.printFile(...{json.dumps([d, tone, th])})')
            page.pdf(path=str(out / f'lume-tok-{d}-{name}.pdf'), width='75mm', height='150mm',
                     print_background=False, margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
        b.close()
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'{d}: vastagítás {th} mm, legnagyobb 0,7 mm alatti rész {worst:.2f} mm² '
          f'({"RENDBEN" if worst <= 0.5 else "VÉKONY"})')


if __name__ == '__main__':
    main(sys.argv[1])
