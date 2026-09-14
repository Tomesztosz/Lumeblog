# Dinamikus főoldal és megosztható modellek

Bevezetés: 2026. szeptember 14.

## Főoldal

A kiemelt helyen mindig a legújabb, már megjelent, nem piszkozat cikk áll. A következő két cikk alatta jelenik meg. A kép, cím, leírás, rovat, dátum és hivatkozás a cikk adataiból származik, nincs beégetett Brew-kiemelés. A képkreditek és licencek megmaradnak.

A sorrend a magyar és angol főoldalon külön, ugyanazzal a logikával készül. Új cikk megjelenésekor nincs kézi főoldalszerkesztés. A webhely továbbra is statikus: az időzített újraépítés és élesítés frissíti. A GitHub-ütemezés késhet, ez nem másodpercre pontos futásidejű adatfrissítés.

## Olvasói használat

A Műhelyben és a cikk modelljénél elérhető **A modell saját oldala** és **Link másolása**. Támogatott böngészőben **Megosztás** is megjelenik, amely a készülék saját megosztófelületét nyitja meg. A felhasználó választja ki a célalkalmazást és hagyja jóvá a küldést.

Példa: [rotor](https://lumejournal.com/muhely/rotor/), [English rotor page](https://lumejournal.com/en/workshop/rotor/).

Minden modelloldalon Lume-arculat, saját cím, leírás, visszaút a részletes cikkhez és a Műhelyhez, valamint magyar/angol váltás található. A link előnézeti adataihoz a kapcsolódó cikk meglévő borítóképét használjuk. A tényleges kártya megjelenítése és gyorsítótárazása a fogadó alkalmazástól függ.

Ez linkmegosztás, nem videóexport, Instagram-posztolás vagy külső oldalba beágyazás. A modell a megnyitott Lume-oldalon interaktív. A korábbi iframe-modellek csak az indítógomb megnyomására töltenek be. Vágólapengedély hiányában kijelölhető, kézzel másolható cím jelenik meg.

## Útvonalak és publikáció

| Modellkulcs | Magyar | Angol |
| --- | --- | --- |
| `gatlomu` | `/muhely/gatlomu/` | `/en/workshop/gatlomu/` |
| `g-shock` | `/muhely/g-shock/` | `/en/workshop/g-shock/` |
| `minute-repeater` | `/muhely/minute-repeater/` | `/en/workshop/minute-repeater/` |
| `oszlopkerek` | `/muhely/oszlopkerek/` | `/en/workshop/oszlopkerek/` |
| `rotor` | `/muhely/rotor/` | `/en/workshop/rotor/` |
| `spring-drive` | `/muhely/spring-drive/` | `/en/workshop/spring-drive/` |
| `vilagora` | `/muhely/vilagora/` | `/en/workshop/vilagora/` |

Az `ugro-masodperc` inline modell ugyanilyen önálló oldalt kap, de csak a cikk megjelenésével, 2026. szeptember 18-án, budapesti idő szerint 05:00 után készült buildben. A szerdai Beamer-piszkozat változatlanul privát.

Az új megosztási céloldalak fejlesztői módban is kizárják a jövőbeli cikkeket és a piszkozatokat. A kézirat külön előnézete ettől független szerkesztői eszköz.

## Fejlesztői ellenőrzés

- `src/lib/published-feed.mjs`: a közös dátumhatár és sorrend.
- `src/lib/shared-models.ts`: engedélyezett modellek, megjelent cikkek és útvonalak.
- `src/components/ModelShare.astro`, `src/lib/model-sharing.ts`: megosztás és vágólap, kizárólag kattintásra, külső SDK és új követés nélkül.
- `node --test scripts/published-feed.test.mjs`: dátumhatár, elcsúszó sorrend, piszkozatok, üres és azonos dátumú lista.
- `npm run build`: a meglévő SEO-, naptár-, biztonsági és Journal-ellenőrzések mellett a tényleges főoldalsorrendet, a modelloldalakat, a nyelvpárokat, megosztási metaadatokat és a jövőbeli modell kizárását is ellenőrzi.
- `node scripts/qa-site-improvements.mjs`: helyi Chrome-próba Windows alatt, friss, elkülönített profillal. A natív megosztás és a vágólap itt szimulált, semmit nem küld ki. Képernyőképek és eredmény: `output/site-improvements-2026-09-14/`.

A nyers `/widgets/*.html` címek megmaradnak, de a márkázott modelloldalak a megosztás céljai. A widgetek továbbra is `noindex` állapotúak. A biztonsági fejlécek és a saját eredetre szűrt üzenetkezelés változatlanok.
