# Lume — órás napló

Kétnyelvű (HU / EN) órás blog. Astro statikus oldal. Heti 3 poszt.
A projekt szándéka és design-nyelve: [lume-brief.md](lume-brief.md) — az az elsődleges forrás.

**Magyarul válaszolj.**

## Parancsok

```bash
npm run dev      # fejlesztői szerver: http://localhost:4321
npm run build    # statikus build a dist/ mappába
npm run preview  # a kész build megtekintése
```

## Szerkezet

```
src/
  site.ts                élesítési kapcsolók: LAUNCHED, MailerLite-URL
  i18n/ui.ts             MINDEN felületi szöveg és útvonal-szelet, HU+EN
  content.config.ts      a poszt-frontmatter sémája (zod)
  content/posts/hu|en/   egy poszt = egy .md fájl
  content/posts/_images/ a cikkek nyitóképei (az aláhúzás miatt nem poszt)
  lib/posts.ts           lekérdezés, rendezés, olvasási idő, URL-képzés
  styles/global.css      design tokenek + minden stílus
  layouts/Base.astro     <head>, fejléc, lábléc, „lámpa le" kapcsoló
  components/            Dial, PostCard, PostMedia, Subscribe, Header, Footer
  components/views/      HomeView, ColumnView, PostView, AboutView (nyelvfüggetlen)
  pages/                 csak routing: minden oldal egy view-t hív egy `lang` proppal
```

**Alapelv:** egy oldal *kinézete* egy view-ban van, nem a `pages/` alatt. A `pages/`
fájlok szinte üresek — csak eldöntik, melyik nyelv és melyik rovat. Ha egy oldal
tartalmát módosítod, a view-t vagy az `i18n/ui.ts`-t módosítsd.

**Szöveg sosem kerül közvetlenül sablonba.** Minden felületi string az `i18n/ui.ts`-ben
van, nyelvenként. Új szöveg → oda, mindkét nyelvre.

## Útvonalak

| | HU | EN |
|---|---|---|
| főoldal | `/` | `/en/` |
| Kézben | `/kezben/` | `/en/in-hand/` |
| Eredet | `/eredet/` | `/en/origins/` |
| Szerkezet | `/szerkezet/` | `/en/movement/` |
| cikk | `/kezben/lorier-neptune/` | `/en/in-hand/lorier-neptune/` |
| Rólam | `/rolam/` | `/en/about/` |

A rovat kulcsa nyelvfüggetlen (`in-hand` / `origins` / `movement`); a látható név és az
URL-szelet az `i18n/ui.ts` `COLUMNS` táblájából jön. A nyelvváltó gomb a *jelenlegi oldal
párjára* visz — cikknél a `translationKey` alapján, ha nincs pár, a másik nyelvű rovatra.

## Új poszt írása

1. Új fájl: `src/content/posts/hu/<slug>.md` (és a párja `en/<slug>.md`).
2. A fájlnév lesz az URL-szelet, ha a frontmatterben nincs `slug`.
3. Frontmatter — a séma `src/content.config.ts`-ben, sablon: [docs/uj-poszt-sablon.md](docs/uj-poszt-sablon.md).
4. `draft: true` → nem kerül bele a buildbe.
5. Ha a HU és EN változat ugyanaz a cikk, adj nekik közös `translationKey`-t.

Az olvasási időt a szövegből számoljuk (kb. 200 szó/perc); a `minutes` mezővel felülírható.

## Ütemezett megjelenés

**A jövőre datált cikk éles buildben nem kerül ki.** Így lehet hétvégén feltölteni azt,
ami hétfőn jelenik meg. A szűrés a `lib/posts.ts`-ben van, és mindenhol érvényesül:
a listákon, az RSS-ben és a sitemapben is — a jövőbeli cikkhez oldal sem generálódik.

**Fejlesztés közben (`npm run dev`) viszont minden látszik**, hogy a készülő írásokat
meg tudd nézni a saját gépeden, mielőtt élesbe kerülnek.

Mivel az oldal statikus, a dátum önmagában nem elég: kell egy újraépítés is azon a
napon. Ezt a `.github/workflows/utemezett-megjelenes.yml` intézi — hétfőn, szerdán és
pénteken 03:00 UTC-kor (nyáron 05:00, télen 04:00 magyar idő) megnézi, van-e aznapra
datált cikk, és csak akkor kér újraépítést. A GitHub felületén kézzel is indítható
(Actions → Ütemezett megjelenés → Run workflow), ha valamit azonnal ki kell tenni.

**Poszt törlésekor:** az Astro tartalom-gyorsítótára a `node_modules/.astro/data-store.json`-ban
él, és a törlést nem mindig veszi észre — a törölt cikk kísértetként tovább épül. Ha ilyet
látsz, `rm -rf node_modules/.astro dist` és újra build. A Cloudflare tiszta klónból épít,
tehát ott ez nem fordulhat elő.

## Képek és forrásmegjelölés

A nyitóképek a `src/content/posts/_images/` alatt élnek, a frontmatterből
`cover.src: '../_images/fajlnev.jpg'` alakban hivatkozva. Innen az Astro maga csinál
WebP-változatokat több méretben, és a `srcset`-et is kitölti — nem kell kézzel méretezni.

**A `cover.credit` kötelező, ha van kép.** A séma nem enged forrás nélküli képet átmenni
a buildon, mert az induló cikkek képei nem sajátok. A hitel *mindenhol* megjelenik, ahol
a kép: a cikk élén és a listakártyákon is. A `license` / `licenseUrl` mezőket töltsd ki,
ha a licenc megköveteli (CC BY, CC BY-SA); ha egyedi engedélyed van, `license: 'engedéllyel'`.

## Szerkesztői szabályok (a briefből)

- Nincs megjelenésnapi hajsza, nincs hype. A tárgy > a hírek.
- **Kitalált forrás vagy tény tilos.** Amit nem lehet ellenőrizni, az vagy bizonytalanként
  jelölve megy be, vagy kimarad. A források a frontmatter `sources` tömbjébe kerülnek, és
  a cikk alján automatikusan megjelennek.
- A jelenlegi 3 minta-poszt tetején ott a figyelmeztetés, hogy még ellenőrizetlen. Valódi
  publikálás előtt vagy ellenőrizni kell őket, vagy törölni.

## Design-nyelv

Paletta, tipográfia és a „lámpa le" aláírás-elem: lásd a briefet. A tokenek a
`src/styles/global.css` tetején vannak (`:root` = nappali, `body.dark` = lámpa le).
**Színt és betűcsaládot sose írj be közvetlenül** — mindig tokenből
(`--paper`, `--ink`, `--brass`, `--lume-glow`, `--font-serif`, `--font-sans`, `--font-mono`).

A betűk saját kiszolgálásból jönnek (`@fontsource*` csomagok, a `global.css` tetején
importálva), nem a Google CDN-jéről — így nem megy látogatói IP a Google-höz, és gyorsabb
is. Csak a ténylegesen használt tengelyek töltődnek: Fraunces wght+opsz (normal és dőlt),
Hanken Grotesk wght, Plex Mono 400/500. Az ékezetes karakterek (`ő`, `ű`) a latin-ext
alhalmazból jönnek, amit a böngésző csak akkor tölt le, ha kell.

A „lámpa le" állapot **szándékosan nem tárolódik**: minden oldalbetöltés nappali nézetben
indul (a brief kimondja: nincs localStorage). Ha ez zavaró lesz több oldalon böngészve,
ez az egy döntés, amit érdemes újratárgyalni.

A képek helyén egyelőre SVG-motívumok állnak (`components/PostMedia.astro`) — ez az
egyetlen hely, ahol a valódi makrófotókra kell majd cserélni.

## Publikálás

Cloudflare Pages, a GitHub-repóhoz kötve: minden `main`-re küldött push automatikusan
deployol. Build parancs `npm run build`, kimeneti mappa `dist`.

**Az oldal éles.** A kapcsoló `src/site.ts` → `LAUNCHED`. Ha `false`, minden oldal
`noindex` és a `robots.txt` mindent tilt; ha `true`, a robots.txt engedélyező és kiírja
a sitemap címét.

- **A domain az `astro.config.mjs` `site` mezőjében van** (`https://lumejournal.com`). Ebből
  képződik a canonical, a hreflang, a sitemap és az RSS minden URL-je — ha a domain
  változik, itt az egy sor átírása elég.
- **Hírlevél: egyelőre nincs kirakva.** Nincs mit kiküldeni, amíg csak pár cikk van;
  az olvasó RSS-sel követ. A `Subscribe.astro` komponens készen áll (MailerLite-ra
  kötve, nyelvet vivő rejtett mezővel) — visszatenni annyi, hogy importálod a
  `HomeView`-ba és/vagy az `AboutView`-ba a `.ethos-follow` bekezdés helyére, és
  kitöltöd a `MAILERLITE_FORM_ACTION`-t a `src/site.ts`-ben.
- `public/` — ami változtatás nélkül kerül a gyökérbe: `favicon.svg`, `apple-touch-icon.png`,
  `og-image.png`, `robots.txt`, `_headers` (Cloudflare cache-szabályok).
- Az ikonokat és az OG-képet a `node scripts/gen-icons.mjs` generálja a `favicon.svg`-ből.
  Csak akkor kell újrafuttatni, ha a márkajel változik.
- `sitemap-index.xml` és `sitemap-0.xml` automatikus (`@astrojs/sitemap`), hreflang-párokkal.
- RSS: `/rss.xml` (HU) és `/en/rss.xml` (EN), a `src/pages/*/rss.xml.ts` fájlokból.

## Ami még nincs kész

- **Képengedélyek.** Engedélyünk a Lorier anyagaira van (négy termékfotó + wordmark).
  A többi kép forrása meg van jelölve, de engedély nincs rá: Luxe Digital (a Lorier-cikk
  nyitóképén az alapítók fotója), Chrono24 (Vacheron-törzsképek), Vacheron Constantin
  és Oracle of Time (a Vacheron-nyitókép), Monochrome Watches (El Primero). A szerző ezt
  tudva döntött az élesítés mellett. Ha bármelyikre kérés érkezik, a kép kivétele annyi,
  hogy a `cover` blokkot vagy a képsort törlöd — a rovat SVG-motívuma áll a helyére.
- **Hírlevél** — szándékosan elhalasztva, amíg nincs mit kiküldeni.
- Logó / wordmark (a favicon egyelőre a számlap-márkajel).
- *Ötlet, nem terv:* AI-val modellezett terrajzok a szerkezetekről a Szerkezet rovathoz.
  Ha ez megvalósul, ugyanaz a `cover` mechanizmus viszi, csak a `credit`-be a
  „saját, AI-val készült ábra" jellegű megjelölés kerül.
