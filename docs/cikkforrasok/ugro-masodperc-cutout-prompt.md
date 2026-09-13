# B10 kivágás: képgenerálási napló

Dátum: 2026-09-13. Mód: beépített imagegen, szerkesztés, `imagegen` skill. Nem CLI/API fallback.

Forrás: a Lange B10 hivatalos makrófotó 1600 × 1003 képpontos helyi WebP-változata. A teljes felbontású eredeti, URL és hash a privát `photo-sources-v1.json` jegyzékben van. A modell a külső háttér eltávolításához készített maszkot; a végső kép színcsatornáit nem generálta újra.

## Pontos prompt

```text
Use case: background-extraction. Edit the supplied original watch-movement macro photograph. Remove ONLY the solid black exterior studio backdrop to real alpha transparency. Keep EXACT original canvas aspect, crop, position, size and geometry: the watch is intentionally cut off at top/right/bottom; do NOT invent or extend any missing parts. Preserve all case metal, lugs, leather strap, engraving, blue screws, jewels and every mechanism detail unchanged. Keep dark enclosed recesses inside the watch opaque. Remove black exterior around the case on the left and bottom right, and empty see-through space between lug and strap. No checkerboard painted into RGB, no white background, no new shadow, no color correction, no new text, no reconstruction. Actual transparent PNG with faithful antialiased edge. This is a technical photo cutout, not a redesign.
```

## Eredmény és feldolgozás

- Eredeti generált fájl: `C:/Users/ftomi/.codex/generated_images/019fcd7a-bc1a-7050-8ba3-4d434bce181f/exec-0f67c730-e0a4-491a-ab26-5c8e88bbf477.png`, 1584 × 993.
- Privát maszk: `output/article-review/ugro-masodperc/sources/lange-jumping-b10-imagegen-mask-v2.png`.
- Végleges cikk-kép: `src/content/posts/_images/lange-jumping-b10-cutout-v2.png`, 1600 × 1003.
- Feldolgozás: `scripts/prepare-jumping-seconds-cutout.mjs`. Csak az alfa csatornát igazítja a forráshoz. Az alfa 245 feletti értékei teljesen fedők, 10 alatti értékei teljesen átlátszók, az átmeneti kontúr megmarad. Az ellenőrzés a határértékeket is ezekhez a csoportokhoz sorolja.
- A teljes kép összes eredeti RGB-mintája változatlan: 0 eltérő csatornaminta. 320 493 teljesen átlátszó és 1 279 352 teljesen fedő képpont. A fekete belső szerkezeti mélyedések nem külső háttérnek számítanak.
- Végső PNG SHA-256: `67a880918a342961908fe382baa91bbf3ceb6212efe9089399f2f8161a6ae7bd`.
- Privát ellenőrzés: `output/article-review/ugro-masodperc/cutout-checks-v2.json`; világos és sötét kompozitnézet külön ellenőrizve.

A sajtófotó kreditje változatlanul Lange Uhren GmbH. Az AI-val támogatott háttéreltávolítást a két nyelvi képaláírás jelzi. A generált maszk, a teljes méretű eredeti és a régi fekete hátteres változat nem kerül az éles képcsomagba. A felhasználási feltételeket és a tulajdonos példányküldési vállalását a [forrásjegyzet](ugro-masodperc.md) rögzíti.
