# Automatikus Lume tartalomjegyzék AI-agenteknek

Ellenőrzés: 2026. október 18. Önálló, statikus kiegészítés a meglévő SEO-réteghez.
A nyilvános kimenet: [llms.txt](https://lumejournal.com/llms.txt).

## Architektúra és formátum

Az alap a [2026. augusztus 10-i llms.txt v2-javaslat](https://llmstxt.org/),
nem kötelező webes szabvány vagy valamennyi AI-szolgáltató által elfogadott protokoll.
UTF-8 Markdown: egy H1, kétnyelvű blockquote és bemutatkozás, H2 témakörök,
listánként hagyományos Markdown-linkek és forrásból származó leírások.
Az `Optional` szakasz neve a javaslat szerinti angol alakban marad.

Az Astro statikus endpointja buildkor gyűjti a tartalmat. A tiszta generátor
nem végez HTTP-lekérést, scrapinget vagy AI-hívást. Nincs új adatbázis,
függőség, futásidejű Worker, háttérszolgáltatás vagy látogatókövetés.
Az endpoint nem fut le minden látogatói kérésnél.

## Megvalósított és módosított fájlok

Ez a fejlesztés teljes forrásfájl-listája. A `dist/` és az `output/llms/`
generált eredmények, nem kézzel karbantartott vagy publikált belső dokumentációk.

| Fájl | Szerep |
| --- | --- |
| `src/data/llms-directory.json` | Verziózott témakörök, besorolási szabályok, méretkeret. |
| `src/lib/llms-description.ts` | Forrásprioritás és biztonságos szövegkinyerés. |
| `src/lib/llms.ts` | Típusos generátor, jogosultsági szűrés, URL-védelem, stabil rendezés, méretkezelés. |
| `src/lib/llms-catalogue.ts` | Meglévő Astro-tartalom, SEO-metaadatok, fordítások és modellek összekapcsolása. |
| `src/pages/[directory].txt.ts` | Buildidőben előállított `/llms.txt`, szükség esetén `/llms-full.txt`. |
| `src/content.config.ts` | Opcionális, nyelvspecifikus `llmsSummary` a posztsémában. |
| `src/i18n/ui.ts` | Valamennyi új, kétnyelvű felületi szöveg. |
| `src/components/JournalHead.astro` | Egyetlen `rel="describedby"` hivatkozás az indexelhető oldalak headjében. |
| `public/_headers` | A két szövegfájl MIME- és gyorsítótár-szabálya. |
| `scripts/llms.test.mjs` | Formátum-, tartalom-, biztonsági, növekedési és frissítési egységtesztek. |
| `scripts/lib/llms-reader.mjs` | Független Markdown-feldolgozás és egyszerű helyi keresés. |
| `scripts/find-llms.mjs` | A jegyzékből kereső opcionális tesztkliens. |
| `scripts/check-llms.mjs` | Kész build, forrásegyezés, regresszió és valódi éles HTTP ellenőrzése. |
| `scripts/check-seo-browser.mjs` | A felfedezési link kezdeti és JavaScript utáni ellenőrzése a meglévő böngészőtesztben. |
| `package.json` | Buildkapu és célzott ellenőrzési parancsok. |
| `tsconfig.seo.json` | Az új TypeScript-modulok célzott típusellenőrzése. |
| `.github/workflows/security.yml` | Az új validálási jelentések CI-artifactként megőrzése. |
| `docs/SEO_IMPLEMENTATION.md` | A korábbi SEO-kör és az új, külön kérésre készült kiegészítés elhatárolása. |
| `LLMS_IMPLEMENTATION.md` | Ez a működési és ellenőrzési dokumentum. |

## Tartalom és tényleges URL-ek

A forrás a `src/content/posts/hu/` és `en/` Astro-gyűjteménye. A gyűjtő a meglévő
`getPosts`, `orderedPublishedPosts`, `getTranslation`, `urlOf`, `sharedModel`,
`journalMetadata`, `resolveSeo` és `canonicalUrl` függvényeket használja.
Az eredeti cikkeket, dátumokat, képeket és publikus URL-eket nem módosítja.

Csak a már publikálható, nem draft és indexelhető tartalom kerülhet be.
A dátumellenőrzés fejlesztői módban is szigorú: a jövőbeli cikk és modell
nem szivároghat a jegyzékbe. A visszavont vagy törölt cikk a következő buildben eltűnik.
A közös SEO-réteg `LAUNCHED` és noindex állapotát a gyűjtő továbbviszi.

A cím kizárólag pontos, HTTPS-es, saját originen lévő canonical cél lehet,
paraméter és fragment nélkül. A generátor nem javít csendben hibás,
átirányításra szoruló címet. A buildellenőrzés minden bejegyzés létező HTML-jét,
önmagára mutató canonicalját, nyelvét és indexelhetőségét külön vizsgálja.
Az éles ellenőrző ezen felül tiltott átirányítás mellett valódi HTTP 200-at vár.

A belső ellenőrzés nem feltételezi, hogy az Astro tartalomazonosítója megegyezik
a fájlnévvel: frontmatter-slug esetén eltérhetnek. Az önálló forrásleltárral
az eredeti URL-képzés, a nyelv és a `translationKey` alapján egyeztet.

A nyilvános interaktív modelloldalak bekerülnek, a nyers `/widgets/` HTML-ek nem.
Nem kerülnek be technikai dokumentumok, szerkesztői előnézetek, query-oldalak,
ICS-ek vagy egyenként a múló naptáresemények. A naptár stabil áttekintője szerepel.

## Besorolás és bővítés

Az első illeszkedő, konfigurált szabály dönt, nem címkulcsszó vagy márkanév.

| Forrásmetaadat | Témakör |
| --- | --- |
| `movement` rovat | Movement Mechanics / Óraszerkezetek |
| `in-hand` és ellenőrzött `topic:independents` tartalomkapcsolat | Independent Makers & Microbrands |
| Többi `in-hand` | Watches & Makers / Órák és gyártók |
| `origins` | Heritage & Iconic Models / Óratörténet |
| Valódi megosztható modelloldal | Interactive Workshop / Interaktív Műhely |
| Naptár áttekintője | Watch Releases / Megjelenési naptár |
| Főoldal, archívum, rovatok, Műhely áttekintője, Rólam | Optional |

A függetlenséget nem találja ki az algoritmus. A meglévő szerkesztői
tartalomgráf ellenőrzött jelölésére támaszkodik; jelölés nélkül a Kézben-cikk
az általános gyártói csoportban marad. Nincs gyártóspecifikus kivétel.
A kategóriák a JSON-ban, kétnyelvű neveik az `LLMS_COPY.categories` alatt bővíthetők.
Az ismeretlen rovat vagy hiányzó felirat hibával megállítja a buildet, nem nyeli el a cikket.

## Leírások és nyelvi párok

Sorrend: `llmsSummary`, `seoDescription`, `description`, majd a meglévő
SEO-segéd által kiválasztott tényleges bevezető teljes mondata vagy bekezdése.
A bevezetőnek teljes mondatzárással kell végződnie. Nincs csonkolás, fordítás,
árbecslés, új műszaki állítás vagy generált összefoglaló.

Az Astro Markdown-feldolgozója és a meglévő HTML-parser távolítja el a formázást.
Script, iframe, kép, komponens, kódblokk és rejtett szöveg nem lesz leírás.
A whitespace és a bekezdéshatárok normalizálódnak; a mértékegységek és szakkifejezések
megmaradnak. A kimeneti Markdown karakterei escape-et kapnak: metaadatból nem
keletkezhet hamis szakasz vagy kattintható külső link. Az eredeti cikkmetaadat változatlan.

Üres vagy nem használható leírás esetén szerkesztői figyelmeztetés készül.
Biztonságos forrás hiányában csak a pontos cím és URL jelenik meg.
Az ellenőrző nem tudja automatikusan bizonyítani a forrásszöveg történeti vagy
műszaki igazságát. A leírás eredetét és változatlan átvételét vizsgálja,
a szakmai hitelesség továbbra is szerkesztői felelősség.

A valós magyar és angol változatok közös `translationKey` szerint kerülnek egymás mellé,
HU, majd EN sorrendben. Eltérő slugjaik a meglévő útvonalképzésből jönnek.
Hiányzó fordításhoz nem készül URL. Azonos URL egyszer szerepelhet;
ellentmondó rekord vagy egy nyelven kétféle fordításazonosság buildhibát okoz.

## Automatikus frissülés és növekedés

Az `astro build` hozza létre a `dist/llms.txt` fájlt. Az élesítéshez kötelező
`npm run build` az új ellenőrzőt is futtatja. A fájl nem kézi forrásállomány.
Új cikk, metaadatmódosítás és visszavonás a következő sikeres buildben követődik.

A meglévő `utemezett-megjelenes.yml` figyeli a publikálási határokat:
00:00 és 23:00 UTC, tartalék ellenőrzés 03:00 UTC. Ez a budapesti 01:00-s
téli és nyári határt is kezeli. GitHub- és buildkésés lehetséges, ez nem percpontos szolgáltatás.
A statikus jegyzék nem frissül build nélkül, és hibás build nem ad ki új verziót.
Új időzítőt nem vezetünk be.

A `maxMainBytes` alapértéke 65 536 UTF-8 byte. Jelenleg minden alkalmas tétel
belefér, ezért nincs `/llms-full.txt`. A nem létező kiegészítő címnek 404-et kell adnia.
Ez a kiegészítő nem a v2 kötelező eleme.

Kerettúllépéskor a teljes lista a `/llms-full.txt` fájlba kerül, a fő jegyzék
`Optional` szakasza erre hivatkozik. A fő változat témakörönként körbejárva,
teljes fordítási csoportokat választ. A prioritás ellenőrzött kiemelés, modellkapcsolat,
majd stabil azonosító; a jelenlegi gyűjtő nem talál ki külön kiemeléseket.
Nem állít keresési népszerűséget, és nem kizárólag dátum alapján rendez.
A teljes fájl sosem veszít cikket a rövid fő jegyzék miatt.

Nincs publikus buildidőbélyeg, véletlen érték vagy bemeneti fájlsorrendtől függő rendezés.
A diagnosztikai jelentés időpontja kizárólag az `output/llms/` alatt szerepel.

## Felfedezhetőség és Cloudflare

Az indexelhető HTML-oldalak közös headje egyetlen ilyen linket kap:

```html
<link rel="describedby" type="text/plain" href="https://lumejournal.com/llms.txt">
```

Nincs hamis `rel="alternate" type="text/markdown"`, mert külön cikk-Markdown nem készült.
A robots.txt, a sitemap, a canonical, a hreflang és a JSON-LD más feladatot lát el,
nem helyettesítjük vagy építjük újra őket.

A meglévő Cloudflare Workers Static Assets a `dist/` tartalmát szolgálja ki.
A `public/_headers` mindkét szövegfájlra `text/plain; charset=utf-8` MIME-ot és
`public, max-age=0, must-revalidate` cache-szabályt ad. Ez engedi a tárolást,
de új felhasználás előtt újraellenőrzést kér. Nincs általános cache-tiltás.
Az éles ellenőrző a tényleges ETag-feltételes lekérést is kipróbálja, ha van ETag.

## Tesztelés és bizonyíték

Megvalósított és helyben tesztelt:

- 17 célzott egységteszt: szintaxis, forrásprioritás, nyelvpárok, jogosultság,
  publikálási határ, publikálás/módosítás/visszavonás, deduplikálás,
  URL- és Markdown-biztonság, konfiguráció, byte-stabilitás és helyi keresőkliens.
- 300 nyelvi tételes növekedési próba, 6500 byte-os tesztkerettel:
  teljes lista, stabil fő jegyzék, megőrzött fordítási párok és rovatképviselet.
- Teljes build: 96 tétel, 60 cikkváltozat, 20 modelloldal és 16 áttekintő oldal;
  24 432 byte, nulla leírási figyelmeztetés. Nincs szükségtelen teljes kiegészítő fájl.
- Minden célnál tényleges HTML, önmagára mutató canonical, helyes nyelv,
  indexelhetőség és forrásból visszaellenőrzött leírás.
- A korábbi éles alap buildjével összevetve változatlan látható cikk-/modell-/naptártartalom,
  canonical, hreflang és séma, valamint byte-azonos RSS, robots.txt, sitemap és ICS.
- Két egymást követő teljes build byte-azonos jegyzéket készített. SHA-256:
  `016fe13f1a0d3d334982e7a30665e581565615598d799741d5344028c83f8536`.
- Böngészős regresszió: 27 SEO-, 18 naptár- és 9 tartalmi ellenőrzés sikeres.
  A SEO-próba az új headlink JavaScript utáni fennmaradását is ellenőrzi.
- 10 külön publikálási/időzítési teszt sikeres; `npm audit`: nulla ismert sérülékenység.

A futtatható ellenőrzések:

```sh
npm run build
node --experimental-strip-types scripts/check-llms.mjs --baseline /path/to/previous/dist
node --test scripts/post-needs-build.test.mjs scripts/published-feed.test.mjs
node scripts/check-seo-browser.mjs
node scripts/check-calendar-browser.mjs
node scripts/check-content-browser.mjs
npm run llms:find -- "George Daniels"
```

A helyi kliens egyszerű szövegegyezéses demonstráció, nem AI-szolgáltatás.
Találata nem bizonyítja külső agentek használatát. Nem ellenőrzött árra vagy
olyan állításra nem ad bizonyító választ, amely nincs a jegyzékben.

Élesítés után, már a telepített verzióhoz tartozó helyi buildből:

```sh
npm run check:llms:http
npm run check:seo:http
node scripts/check-seo-browser.mjs --production
```

Az éles próba ellenőrzi a nyers HTTP 200-at, UTF-8-ot, MIME-ot, cache-et,
ETag-viselkedést, a builddel egyező tartalmat, mind a 96 cél URL-jét,
indexelhetőségét, canonicalját és felfedezési linkjét. Nem fogad el HTML fallbacket.
A szükségtelen `/llms-full.txt` 404-ét is megköveteli.

Jelentések: `output/llms/manifest.json`, `validation.json`,
`production-validation.json`. A CI az első kettőt 30 napig tárolja.
A kétszeri tényleges build összehasonlítása külön `determinism.json` jelentésben rögzíthető.
A helyi teszt nem éles bizonyíték: a publikált státuszt csak sikeres,
az aktuális kimenettel egyező `production-validation.json` igazolja.

Megvalósított és éles környezetben is ellenőrzött, 2026. október 18.:
`/llms.txt` HTTP 200, `text/plain; charset=utf-8`,
`public, max-age=0, must-revalidate`, a helyi builddel egyező 24 432 byte.
Mind a 96 cél közvetlenül HTTP 200, megfelelő canonical és felfedezési link mellett.
A szükségtelen `/llms-full.txt` HTTP 404. Nulla hiba.
A külön éles SEO-próba 96 oldalt és 50 képet, összesen 158 ellenőrzést végzett,
nulla hibával. A valódi domainen a 27 böngészős SEO-/Műhely-próba is sikeres.
Ebben a kiadásban nincs élesben ellenőrizetlen kötelező funkció.
Külső AI-szolgáltatók felhasználását továbbra sem állítjuk igazoltnak.

Valódi részlet a generált kimenetből, nem külön karbantartandó példaállomány:

```markdown
## Movement Mechanics / Óraszerkezetek

- [HU: George Daniels és a gátlómű, amelyre sokáig senki sem várt](https://lumejournal.com/szerkezet/co-axial/): Hogyan működik a Co-Axial? George Daniels, a Patek és Rolex prototípusai, az Omega 2500 és a két impulzusút részletes interaktív modellen\.
- [EN: George Daniels and the escapement the industry was slow to want](https://lumejournal.com/en/movement/co-axial/): How the Co-Axial works, with an interactive model: Daniels' Patek and Rolex prototypes, Omega calibre 2500, and direct versus indirect impulse\.
```

## Korlátok, mérés és későbbi lehetőségek

Külső szolgáltatástól függő, nem garantálható: letöltés, feldolgozás,
AI-válaszban felhasználás, hivatkozás vagy új forgalom. A Google a
[hivatalos AI-optimalizálási útmutatója](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
szerint nem használja az llms.txt-t rangsorolásjavításra. Ez nem Google SEO-trükk.

A meglévő Cloudflare HTTP-forgalmi naplókban, amennyiben az adott csomag és
hozzáférés elérhetővé teszi, a saját domain és a pontos `/llms.txt` útvonal
szerint lehet szűrni, majd státuszkódot, időpontot és user agentet vizsgálni.
A fiók naplózási jogosultságát és csomagját nem állítottuk át, lekérési darabszámot
nem állítunk hozzáférés nélkül. A statikus asset cache-ből kiszolgált kérései
nem feltétlenül jelennek meg futásidejű Worker-logban. A user agent hamisítható;
a letöltés nem azonos a tartalom felhasználásával vagy az AI-hivatkozások számával.
Nincs emiatt új tracking vagy követőpixel.

Opcionális későbbi fejlesztés: ellenőrzött, teljes cikk-Markdown-változatok,
valódi `alternate` kapcsolattal, helyesen kezelt beágyazott modellekkel,
képkreditekkel és fordításokkal. Ez nem része a mostani kész megoldásnak.
Ugyancsak külön jóváhagyású lehetőség egy leírásjavasló szerkesztői eszköz;
ellenőrizetlen AI-szöveg nem kerülhet automatikusan a nyilvános jegyzékbe.
