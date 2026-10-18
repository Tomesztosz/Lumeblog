# SEO-megvalósítás: P0 és P1

2026. október 18. A hatókör nem tartalmazza a P2 entitás- és ajánlórendszer,
a P3 forgalomelemzés vagy tömeges szerkesztői átírás megvalósítását.

## Közös metaadatok

`src/lib/seo.ts` tartalmazza a típusos `SeoHeadProps`, `ResolvedSeo`,
`SocialImage` és `JsonLd` szerződéseket, a cím-, leírás-, URL-, dátum- és
sémakezelést. A `JournalHead.astro` ezt használja; a régi `Base.astro` is
ugyanennek a komponensnek delegálja a headet. A fejléc és a cikk kinézete
nem alakult át.

| Mező | Feladat | Alapértelmezés |
| --- | --- | --- |
| `title` | Szerkesztői cím, kártyák és cikkhivatkozások | Meglévő kötelező cím |
| `heading` | Opcionálisan eltérő cikk-H1 | `title` |
| `seoTitle` | Keresőnek javasolt title | `title`, egyszeri Lume márkajelzéssel |
| `description` | Látható szerkesztői felvezető | Meglévő érték; hiányánál üres |
| `seoDescription` | Meta/OG/Twitter leírás | `description`, végső esetben a tényleges bevezető első használható bekezdése |
| `updated` | Érdemi szerkesztői frissítés dátuma | Nincs automatikusan létrehozva |

A `heading` nem került automatikusan egyetlen cikkbe sem. A meglévő minőségi
leírások megmaradtak. A fallback nem generatív összefoglaló, nem alakít át
szakmai állítást és nem írja vissza a Markdown-forrást. A cikk JSON-LD
`headline` mezője a tényleges H1-et követi.

A címképzés eltávolítja az ismételt Lume utótagot. Ha a név már természetesen
része a címnek, nem told hozzá még egyet. Nincs automatikus karakterlimit
vagy kulcsszólista. A Google továbbra is megváltoztathatja a megjelenő címet.

## URL-ek és nyelvek

Az éles domain továbbra is az Astro konfigurációjából érkezik. A közös URL-
kezelés saját HTTPS dokumentumcímet készít, query és fragment nélkül. A
nyelvi kapcsolat konkrét másik útvonalat fogad, nem képez angol slugot a
magyar elé tett `/en/` előtagból. Külső, azonos vagy rossz nyelvű fordítási
cél hibát okoz; fordítás nélküli rovat-fallbackből nem készül hreflang.
A `getTranslation` az egynél több, azonos nyelvű tartalmi kulcsot elutasítja.

A robots és az indexelhetőségi kapcsoló változatlan maradt. A sitemap-
generálást nem duplikáltuk: a meglévő, kész HTML-re építő integráció maradt,
szigorúbb utóellenőrzéssel. A naptárszűrők canonical célja az alapsajátoldal.
Nem került noindex a rovatokra, az archívumra vagy a Műhelyre.

## Strukturált adatok

- Közös `WebSite` és `Organization`, a tényleges, láblécben is megjelenő
  Instagram-profillal. Nincs kitalált személy, cím, cégméret vagy szakértői cím.
- Cikk: `BlogPosting`, látható szerzővel, stabil megjelenési dátummal,
  opcionális valódi frissítéssel, megfelelő képpel és `BreadcrumbList` adatokkal.
- Rovat, archívum, Műhely, naptár: a tartalomnak megfelelő
  `CollectionPage`/`ItemList`. A lista saját, létező Lume-célokra mutat.
- Önálló modell: `WebPage`, kapcsolódó cikk és követhető navigációs út.
- A naptár nem kap `Event` vagy kereskedelmi `Product` sémát. A kártyák
  saját, stabil horgonyára mutat; egy előrendelési nap nem `releaseDate`.
  A privát szerkesztői jelölt a JSON-LD-be sem kerül be.

A naptári listát a meglévő `sortCalendar` és `matchesCalendar` aktuálisnézet-
szűrője állítja elő. A SEO nem tart fenn saját állapotbesorolást. Ezzel a
fő munkakönyvtárban előkészített aktuálisnézet-szűrés szándéka is megmarad.

A jelenlegi tartalmi készletben a validátor elutasítja a Product, Event,
Review, AggregateRating, FAQPage és a megszüntetett keresődobozhoz tartozó
SearchAction sémát. Jövőbeli, ténylegesen megfelelő új oldaltípushoz ez a
szabály külön, a hivatalos jogosultsági feltételekkel együtt vizsgálandó.
Nem állítunk általános rich result jogosultságot a gyűjtőoldalakhoz.

## Újrafuttatás és kiadási menet

```sh
npm ci
npm run build
npm run check:seo:browser
node scripts/check-calendar-browser.mjs
node --test scripts/coaxial-model.test.mjs scripts/rattrapante-model.test.mjs
```

Az Astro build után futó `check:seo` a közös SEO-réteget TypeScript 6.0.3
fordítóval ellenőrzi, 15 egységtesztet futtat és a kész HTML-t validálja.
A célzott `tsconfig.seo.json` nem állítja, hogy a teljes régi kódbázis minden
modulja új típusellenőrzést kapott. A TypeScript egyetlen új, rögzített
fejlesztői függőség; nincs új futásidejű szolgáltatás vagy követőkód.

A validálás többek között a duplikált brandet, canonical/hreflang célokat,
sitemap/noindex/lastmod összhangot, megosztási képeket, belső linkeket és
horgonyokat, JSON-LD szerzőt, nyelvet, dátumokat és látható HTML-egyezést
ellenőrzi. A hiba buildet állít meg, a figyelmeztetés és a manuális teendő
külön listában jelenik meg. A CI `seo-validation` jelentése 30 napig elérhető.

A böngészős CLI a meglévő helyi Chrome-segédet használja. Összeveti a kezdeti
HTML és a JavaScript utáni title/meta/schema állapotot, vizsgálja a mobilos
szélességet, sötét módot, a Co-Axial és rattrapante vezérlőit, a JavaScript
nélküli szöveges kontextust és a CSP-hibákat.

Élesítés után, a tényleges build elkészültekor:

```sh
npm run check:seo:http
node scripts/check-seo-browser.mjs --production
```

Az első parancs a build minden indexelhető oldalát, összes különböző
megosztási képét, a feedeket, sitemapeket, query-canonical címeket,
ismeretlen URL-eket és dokumentumvariánsokat ellenőrzi az éles domainen.
Ez hálózati, olvasási próba, nem keresőmotorhoz történő beküldés.

## Migráció és visszaállíthatóság

Nincs URL-migráció, átírt cikk, új gyűjtőoldal vagy megváltozott időzítés.
Az új `heading` opcionális. Az új közös sémaépítők a meglévő
`journalMetadata` hívási pontján keresztül működnek. A naptár állapot-,
forrás-, időzóna- és dátumalgoritmusa nem változott.

A kiadás külön ágon, tiszta éles alapból készül, a fő munkakönyvtár korábbi
cikkes és Instagram-módosításainak érintése nélkül. Visszaállításkor a
dedikált SEO-commit visszavonható, destruktív reset nélkül. A P0/P1 előtti
alapállapot `cffbe2d`; a naptár előző frissítését nem kell visszavonni.

## IndexNow: most nem aktív

Az aktuális felmérés nem bizonyított indexelési késést. A meglévő sitemap
és RSS mellé ebben a körben nem kapcsoltunk be új URL-beküldési szolgáltatást.
Az IndexNow bekötéséhez önmagában nem kell Bing API-fiók: a protokoll saját
domainen kiszolgált kulcsfájllal igazolja a jogosultságot.

Ha később indokolt a bekötés:

1. Saját, véletlen kulcs és a domain gyökerében valóban elérhető UTF-8
   kulcsfájl kell. Nem más oldal kulcsát vagy kitalált ellenőrzést használjuk.
2. Az új/érdemben módosult/megszűnt nyilvános URL-ek tartalmi lenyomatát kell
   összevetni az utolsó sikeres beküldéssel. A változatlan build nem új esemény.
3. Csak az éles HTTP-állapot és canonical ellenőrzése után szabad jelezni.
   Piszkozat, jövőbeli cikk, widget, filterkombináció és technikai aldomain nem kerülhet be.
4. Siker esetén kell tartósan elmenteni az elfogadott állapotot; 429/5xx
   esetén korlátozott visszalépéses újrapróba, hiba esetén nincs hamis siker.
5. A 200/202 válasz a kérés fogadását jelzi, nem indexelési vagy helyezési garancia.

Ez tervezett opcionális integráció, nem elkészült vagy aktív automatizmus.
Normál cikkekhez Google Indexing API-t nem használunk.

## Hivatalos irányelvek

Ellenőrizve: 2026. október 18. Dokumentált követelmény a technikai
hozzáférhetőség és a valós tartalommal egyező séma. Ajánlás a leíró cím és a
jó tartalom; a forgalmi hatás csak későbbi adatokkal vizsgálható hipotézis.

- [Google: címek](https://developers.google.com/search/docs/appearance/title-link)
- [Google: nyelvi változatok](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: sitemap és jelentős módosítási dátum](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Event jogosultság](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google: generatív keresési útmutató, frissítve 2026. július 10.](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [IndexNow: protokoll, kulcsfájl és válaszkódok](https://www.indexnow.org/documentation)
- [Cloudflare: statikus HTML-útvonalak kezelése](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)

Nem készült llms.txt, rejtett AI-szöveg, általános FAQ-séma, kitalált
értékelés vagy mesterségesen feldarabolt tartalom. Nincs első helyre,
Discover- vagy AI-válaszba kerülésre tett ígéret.
