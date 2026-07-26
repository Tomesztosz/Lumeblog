---
# Kötelező mezők
title: 'A cikk címe'
description: 'Egy-két mondat felvezető. Ez megy a listákba és a meta description-be.'
date: 2026-08-03
column: 'in-hand' # 'in-hand' | 'origins' | 'movement'
lang: 'hu' # 'hu' | 'en'

# Nyitókép — elhagyható. Ha nincs, a rovat SVG-motívuma jelenik meg helyette.
# A képfájl a src/content/posts/_images/ mappába kerül.
# A `credit` KÖTELEZŐ, ha van kép: a séma nem enged forrás nélküli képet a buildbe.
# cover:
#   src: '../_images/lorier-neptune.jpg'
#   alt: 'Mit ábrázol a kép — képernyőolvasónak és ha nem tölt be'
#   credit: 'Fotós vagy forrás neve, ahogy ő kéri'
#   creditUrl: 'https://a-forras-oldala.hu/kep'
#   license: 'CC BY-SA 4.0'          # vagy pl. 'engedéllyel'
#   licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'

# Opcionális mezők
# slug: 'egyedi-url-szelet'   # alapból a fájlnév
# minutes: 7                  # alapból a szóból számolt olvasási idő
# translationKey: 'valami'    # a HU és EN változat közös kulcsa
# draft: true                 # nem kerül bele a buildbe

sources:
  - label: 'A forrás megnevezése'
    url: 'https://pelda.hu/cikk'
  - label: 'URL nélküli forrás is lehet (könyv, nyomtatott anyag)'
---

Az első bekezdés. Ez már a cikk törzse — a felvezetőt (`description`) a sablon külön
szedi ki fölé, tehát itt ne ismételd meg.

## Alcím

Bekezdés. **Félkövér**, *dőlt*, [link](https://pelda.hu).

> Kiemelt idézet — a sablon sárgaréz vonallal és Fraunces betűvel szedi.

- felsorolás
- második pont

---

Vízszintes vonal a szakaszhatárra, ha kell.
