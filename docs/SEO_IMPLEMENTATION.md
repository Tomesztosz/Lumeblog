# SEO-megvalósítás: P0, P1, P2 és P3

2026. október 18. A P0/P1 technikai kiadást külön jóváhagyott P2/P3 fejlesztés
követte. Tömeges szerkesztői átírás és élő fiókhozzáférés nélküli forgalomelemzés
egyik körben sem történt.

## P2: tartalmi gráf és kapcsolatok

`src/data/content-graph.json`: nyelvfüggetlen azonosítók, HU/EN címkék,
ellenőrzött aliasok és opcionális szülőkapcsolat. Típusok: márka, család,
modell, referencia, szerkezet, komplikáció, elv, korszak, személy, téma,
rovat, Műhely-modell és naptáresemény. Egy család nem öröklődik automatikusan
konkrét referenciává. A két fordítás egy `translationKey` hozzárendelését használja.
Az új cikknek nem kötelező az entitásmező, és nem került új kötelező frontmatter
a kéziratokba. A helyi leltár jelzi a hiányzó szerkesztői hozzárendelést.

`src/lib/content-graph.mjs`: pontos, típus szerint keresett aliasfeloldás;
nem pásztáz prózát kulcsszófelismeréssel. Az ajánló csak publikált, nem
piszkozat, azonos nyelvű oldalt ad vissza, saját magát és ismétlődő
`translationKey`-t kizárva. A sorrend determinisztikus, a bemenetet nem módosítja.

Először a meglévő kézi `article-relations.json` kapcsolatok, majd a külön
szerkesztett összehasonlítási útvonalak érvényesülnek. Ezután a pontos
entitásjel erőssége rangsorol. A referencia 24, modell 20, család 16,
szerkezet 14, elv 10, komplikáció 8, személy 7, korszak 4, téma/márka 1
belső pont. A rovat önmagában 0. Ezek olvasói relevanciaparaméterek,
nem Google-rangsorolási súlyok. Márka/téma/személy egyezése önmagában nem
nyit automatikus publikus linket; ahhoz kézi kapcsolat vagy pontos
referencia/modell/család/szerkezet/elv/komplikáció egyezése kell.
Maximum három cikk jelenik meg. Nincs frissességalapú irreleváns kitöltés.

A publikus ajánló indoka a kártyán olvasható. A gyengébb találatok csak az
`output/seo-p2-p3/content-inventory.json` szerkesztői sorában szerepelnek.
Az entitásgráf nem hoz létre publikus címkeoldalakat vagy új Product/Event sémát.

`ContentConnections.astro` normál HTML-linkekkel vezeti az olvasót a cikkből
a saját és kapcsolódó modellhez, illetve az igazolt naptárkártyához.
A Műhely-oldalról kapcsolódó írás és másik modell is elérhető. A naptár
három kézi kötése külön jelöli a család- és referencia-pontosságot.
A cikk felől a lejárt/ellenőrzésre váró naptárkapcsolat nem aktív ajánlat;
dátumra váró kártyához a megfelelő `status=announced` nézetbe vezet a link.
A naptár algoritmusát, forrásait, dátumait, állapotait és ICS-szemantikáját
ez a réteg nem módosítja.

## P3: szerkesztői előkészítés és mérési eszközök

`MODEL_READING_GUIDES` a közös HU/EN felületi szótárban: modellenként eltérő
kérdés, megfigyelési feladat és korlát. A tíz modell mindkét nyelvén a kezdeti
HTML része. A rajzok és scriptek változatlanok; nem kaptak közös sablonprózát.

`DesignCollection.astro` és a gráf három gyűjtőterve szerkesztett bevezetőt,
valós cikkeket és létező Műhely-linkeket használ. Fejlesztői előnézet:
`/design/collections/magyar/regulation/` és megfelelő angol/téma útvonalak.
Éles buildben a route nulla oldalt generál, az előnézet noindex. Nincs
mesterséges cikkszámküszöb vagy automatikus tömeges gyűjtőpublikáció.

A [tartalmi értékelés](SEO_CONTENT_REVIEW.md) elválasztja a meglévő lefedettséget,
az átfedéseket és a még kutatandó kérdéseket. Nem bizonyít keresési igényt
és nem írja vissza a javaslatot a cikkbe.

`scripts/seo-measure.mjs` és `scripts/lib/seo-measurement.mjs` helyi,
manifesttel leírt CSV-exportot importál. Pontos szemcsézettséget, időszakot,
dimenziókat, időzónát, forrást és szűrőket vár; elutasítja a duplikált vagy
érvénytelen sorokat. Az exportált URL-eket a valós buildhez köti, nyelvet és
oldaltípust rendel hozzájuk. Külön kezeli a lekérdezéseket, ismeretlen URL-eket,
új publikációkat, kis mintát és hiányzó adatot. A CTR-t újraszámolja, a pozíciót
megjelenéssel súlyozza. Web/Discover/image/multimodal/Google AI/Bing AI nem adódik
össze. AI-idézésből nem készül kattintás vagy helyezés.

A mérés 28 napos és 3/6 naptári hónapos ablakot, összehasonlítható baseline-t,
valamint opcionális, átlátható szerkesztői prioritást támogat. A nyers adat és
a jelentés `.seo-private/` alatt marad, Gitből kizárva; nincs külső adatküldés.
Éles fiókot nem kötöttünk be. A [mérési kézikönyv](SEO_MEASUREMENT.md) tartalmazza
a mintát, a döntéstámogató mutatókat és a tulajdonosi feladatokat.

## P2/P3 ellenőrzési kapuk

Az `npm run build` része az entitás-, alias-, fordítás-, forráshorgony-,
modell- és naptárkapcsolat-validátor, az ajánló és import egységtesztjei,
a valódi CLI szintetikus tesztje, valamint a generált HTML ellenőrzése.
A szintetikus tesztsorok nem Lume-látogatottsági adatok.

```powershell
npm run seo:editorial
npm run check:content:browser
node scripts/check-content-build.mjs --baseline E:/Lume/output/release-seo-20261018/dist
node scripts/check-content-performance.mjs --baseline E:/Lume/output/release-seo-20261018/dist
```

Az utolsó kettőhöz egy tényleges korábbi build helyi könyvtára kell; a példa
ennek a kiadásnak az alapállapota. A böngészős eszköz a meglévő windowsos
Chrome-segédeszközt használja, Linux CI-ben nem fut automatikusan.
Az előtte/utána labor azonos nézetméretet, CPU-/hálózatlassítást és kikapcsolt
cache-t használ. Nem CrUX, nem terepi p75 és nem INP-mérés.
A nyilvános linkek ellenőrzése és a forrásleltár CI-artifactként is megmarad.

## Megőrzött P0/P1 infrastruktúra

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
