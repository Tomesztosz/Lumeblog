---
# Kötelező mezők
title: 'A cikk címe'
description: 'Egy-két mondat felvezető. Ez megy a listákba és a meta description-be.'
seoTitle: 'Márka vagy szerkezet neve: a cikk konkrét témája'
seoDescription: 'Tömör, egyedi keresőleírás. A látható felvezetőt nem módosítja.'
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
# updated: 2026-09-06         # kizárólag érdemi tartalmi javításkor

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

## Publikálás előtti SEO-ellenőrzés

- A `seoTitle` nevezze meg a tényleges márkát, modellt vagy műszaki témát. Ne sorolj fel nem tárgyalt órákat keresőszavak kedvéért.
- A fordításpár ugyanazt a `translationKey` értéket kapja. Az URL a publikálás után lehetőleg ne változzon.
- A nyitókép lehetőleg legalább 1200 pixel széles eredeti legyen. A rendszer ebből készíti a megosztási képet, felméretezés nélkül.
- A cikk képeit a `src/content/posts/_images/` mappából hivatkozd, hogy a rendszer automatikusan méretezze és tömörítse őket. A képkredit maradjon meg.
- Valóban kapcsolódó cikkekhez a `src/data/article-relations.json` fájlban add meg a közös témájú `translationKey` csoportot. Ne pusztán keresőszavak miatt köss össze témákat.
- Az `npm run build` automatikusan SEO-ellenőrzést is futtat. Részletek: `docs/seo.md`.
- Az új megjelenés vagy időzítés kötelező naptárellenőrzését ez nem helyettesíti.
