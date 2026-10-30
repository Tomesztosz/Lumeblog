#!/usr/bin/env python3
"""Karakterlapok: a jelenetekből és az arckifejezés-sorokból összerakott áttekintő lapok.
Előbb a render.py fusson. Kimenet: output/kabala/lap-*.png"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'kabala'
NM = (ROOT / 'node_modules').as_uri()

CAST = [
    ('tenten', 'Ten-Ten', 'The narrator',
     'A 1969 panda chronograph. Survived the quartz crisis and still takes it personally. His face is the dial, so his mood is whatever time it is.',
     ['Dramatic veteran, heart of gold', 'Allergic to hype. Literally sneezes at “limited edition”',
      'Adores small workshops and stubborn founders', '38 hours of power reserve. Falls asleep at the climax',
      'Laughs at himself first'],
     'Warm, gravelly, unhurried. A favourite grumpy uncle with perfect timing.',
     ['“Lights off. Story time.”', '“Don’t say it. Don’t say battery.”', '“Limited edition? ACHOO.”'],
     'Eyes are the two subdials. The hour and minute hands are his moustache: 10:10 smug, 8:20 crushed. The date window is his mouth, the chrono hand his mood antenna.'),
    ('dot', 'Dot', 'The spark',
     'A lume pip that fell off an index and never looked back. Tiny, fearless, powered by light and drama.',
     ['Pure enthusiasm, zero chill', 'Fully charged: unstoppable. Fading: whispery and poetic',
      'Sunbathes under the bench lamp', 'Owns the dark. Opens every video with the glow'],
     'Fast, bright, a little squeaky. Sound effects count as dialogue.',
     ['“LIGHTS OFF!”', '“Do not disturb. Charging.”', '“Was that… a click?”'],
     'Brightness is his energy bar. In the dark he is the light source of the scene, so he carries the hook.'),
    ('tick', 'Tick', 'The numbers',
     'A lollipop seconds hand who hops eight times a second, because 28,800 vph is a lifestyle.',
     ['Talks too fast, knows every calibre number', 'Loses his mind over column wheels',
      'Cannot stand still. Ever', 'Owns the specs segment, so every video carries its reference numbers'],
     'Rapid, nerdy, breathless. Gets louder as the numbers get smaller.',
     ['“Okay okay okay, listen.”', '“Column. Wheel.”', '“Reference number or it didn’t happen.”'],
     'The counterweight is his pogo foot, the needle tip his cowlick. The face disc glows at night.'),
    ('loupe', 'Madame Loupe', 'The critic',
     'A 10× loupe in a knurled gown and a pearl string. Sees everything. Forgives very little.',
     ['Polarising on purpose', 'Gossips about finishing like it is royalty',
      'Secretly fair: she only gushes when it is earned', 'Final word on quality, the “under the loupe” verdict'],
     'Low, velvety, theatrical. Long pauses before the verdict.',
     ['“Darling. Look closer.”', '“Ten times. I see everything.”', '“Is that… a SCRATCH?”'],
     'No mouth. She speaks with one magnified eye, a lid and a brow, which makes her instantly readable in any frame.'),
]


def page(key, name, role, bio, traits, voice, lines, design):
    scenes = sorted(OUT.glob(f'{key}-[12]-*.png'))
    imgs = ''.join(f'<img class="sc" src="{p.as_uri()}">' for p in scenes)
    return f"""<!doctype html><meta charset="utf-8"><style>
@font-face {{ font-family: Fr; font-weight: 100 900; src: url('{NM}/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2'); }}
@font-face {{ font-family: Fr; font-style: italic; font-weight: 100 900; src: url('{NM}/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2'); }}
@font-face {{ font-family: Hk; font-weight: 100 900; src: url('{NM}/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2'); }}
@font-face {{ font-family: Mono; src: url('{NM}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'); }}
body {{ margin: 0; width: 2400px; background: #f2f0e8; color: #242722; font-family: Hk; }}
.wrap {{ padding: 90px 100px 100px; }}
.top {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 70px; margin-bottom: 70px; }}
h1 {{ font: 600 150px/0.95 Fr; font-variation-settings: 'opsz' 144, 'SOFT' 60; letter-spacing: -4px; margin: 0; }}
.role {{ font: 22px Mono; letter-spacing: 5px; text-transform: uppercase; opacity: .6; margin: 26px 0 30px; }}
.bio {{ font: italic 400 36px/1.35 Fr; margin: 0; }}
h2 {{ font: 20px Mono; letter-spacing: 4px; text-transform: uppercase; opacity: .55; margin: 0 0 18px; font-weight: 400; }}
ul {{ margin: 0 0 40px; padding: 0; list-style: none; }} li {{ font-size: 29px; line-height: 1.4; padding: 10px 0; border-top: 1.5px solid #24272226; }}
p {{ font-size: 29px; line-height: 1.45; margin: 0 0 40px; }}
.q {{ font: 500 34px/1.3 Fr; margin: 0 0 16px; }}
.scenes {{ display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }}
.sc {{ width: 100%; display: block; border-radius: 6px; }}
.ex {{ width: 100%; display: block; margin-top: 40px; border-radius: 6px; }}
</style><div class="wrap"><div class="top">
<div><h1>{name}</h1><div class="role">{role}</div><p class="bio">{bio}</p></div>
<div><h2>Personality</h2><ul>{''.join(f'<li>{t}</li>' for t in traits)}</ul><h2>Voice</h2><p>{voice}</p></div>
<div><h2>Says things like</h2>{''.join(f'<div class="q">{l}</div>' for l in lines)}<h2 style="margin-top:40px">Design logic</h2><p>{design}</p></div>
</div><div class="scenes">{imgs}</div><img class="ex" src="{(OUT / f'{key}-expressions.png').as_uri()}"></div>"""


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 2400, 'height': 1000})
    for i, c in enumerate(CAST, 1):
        tmp = OUT / '_lap.html'
        tmp.write_text(page(*c), encoding='utf-8')
        pg.goto(tmp.as_uri())
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(400)
        pg.locator('body').screenshot(path=str(OUT / f'lap-{i}-{c[0]}.png'))
        tmp.unlink()
        print(c[0])
    b.close()
