# Lume SEO audit: P0 és P1

Ellenőrzés: 2026. október 18. Alapállapot: `cffbe2d`. Hatókör: technikai
SEO és közös infrastruktúra. A P2 témakapcsolatok és P3 mérési fejlesztések
nem kerültek automatikusan megvalósításra.

## Vizsgált rendszer

Astro 7.3.1, statikus HTML, Markdown-tartalomgyűjtemény, két nyelv, saját
kiszolgálású képek és fontok. A `JournalPage` a `LumeNext` komponensen keresztül
renderel; az éles head a `JournalHead`, nem pusztán a korábbi `Base` layout.
Cloudflare Workers Static Assets szolgálja ki a buildet. GitHub Actions végzi
a buildellenőrzést, az időzített újraépítést és a külön naptárfigyelést.

A felmérés a forráskódot, a generált HTML-t, a JavaScript utáni DOM-ot és
éles HTTP-válaszokat is vizsgálta. A mintában mindkét nyelv főoldala, rovata,
cikke, archívuma, Műhelye, önálló modellje, naptára és bemutatkozása szerepelt.
A teljes buildellenőrzés 96 indexelhető oldalt és 60 cikkváltozatot fed le.

## Bizonyított hibák és javítások

| Azonosító | Szint | Bizonyíték az alapállapotban | Eredmény |
| --- | --- | --- | --- |
| SEO-01 | P0 | A `/szerkezet/co-axial/`, rattrapante és Todd Beamer cikkpár title értéke `\| Lume \| Lume` végű. Hat cikkoldal érintett. | Kijavítva, idempotens címképzés. A látható cím változatlan. |
| SEO-02 | P0 | A naptár két nyelvében a Mantis szeptember 1-jei és a Lorier október 5-i rendelési dátuma `Product.releaseDate` mezőbe került. Ezek nem igazolt termékmegjelenési napok. | Kijavítva, szerkesztői `CollectionPage` és bejegyzéshivatkozások, hamis dátum és kereskedelmi séma nélkül. |
| SEO-03 | P1 | A Műhely, naptár és bemutatkozás címében a természetes Lume név mellé újabb Lume utótag került. Hat további oldal. | Kijavítva, a brand egyszer szerepel. |
| SEO-04 | P1 | A `Base` és `JournalHead` külön tartotta a head-logikát; a sémákban ismétlődtek az alapelvek. | Közös típusos SEO- és sémaépítők, közös head. |
| SEO-05 | P1 | A régi ellenőrzés az oldalak közötti címduplikációt kereste, de az egy címen belüli brandduplázást nem. A JSON-LD szintaxisát vizsgálta, a rendelés/megjelenés tévesztést nem. | Bővített szemantikus ellenőrzések és regressziós tesztek. |

A 12 címváltozás tételes előtte/utána listája az ellenőrzési összefoglalóban
található. Sem a cikkek szövege, sem a frontmatter meglévő címei nem változtak.

## Meglévő és megfelelő

- A saját nyelvi canonical címek HTTPS-esek. A hreflang-párok kölcsönösek,
  a tényleges `translationKey` alapján készülnek. Eltérő magyar/angol slugok
  működnek. A hiányzó fordítás rovat-fallbackje nem kap fordításjelölést.
- A magyar verzió valós alapértelmezett nyelv, ezért a meglévő magyar
  `x-default` megmaradt. Ez nem egy kitalált nyelvválasztó URL.
- A sitemap 96 valóban indexelhető canonical címet tartalmaz. A sitemap
  nyelvi kapcsolatai az elkészült HTML-ből származnak. A `lastmod` csak a
  szerkesztő által jelzett érdemi frissítésből készül, nem a build idejéből.
- A robots.txt engedélyezi a publikus tartalmat és megadja a sitemapet.
  A belső kereső helyi felület, nem hoz létre keresőtalálati oldalakat.
  A naptár paraméteres címei a szűretlen saját nyelvi oldalra canonicalizálnak;
  a szerver ugyanazt a kezdeti dokumentumot küldi.
- A nem létező magyar és angol címek HTTP 404-et és noindex HTML-t adnak.
  A HTTP a HTTPS címre 301-gyel irányít. A létező dokumentumok perjel nélküli
  és `index.html` változatait a Cloudflare jelenleg egy lépésben, 307-tel
  normalizálja. Nem állítjuk, hogy ez permanens 301-es szabály lenne.
- A közvetlen `/404.html` 307-tel `/404` címre kerül, amely önálló statikus
  hibadokumentumként 200/noindex választ ad. Nem szerepel a sitemapben és
  nem célja belső tartalmi linknek. Ez nem az ismeretlen URL-ek státusza:
  azok ténylegesen 404-et adnak. Emiatt nem vezettünk be külön futó Workert.
- A cikk és az interaktív modellek szöveges kontextusa a kezdeti HTML-ben is
  elérhető. A modellek futtatása nélkül is azonosítható a téma.
- A cikkeknek saját OG/Twitter képe, képmérete és alternatív szövege van.
  Az érdemi képek eredetét és a meglévő jóváhagyott képeket nem módosítottuk.
- A szerző a ténylegesen megjelenített Lume kiadvány, `Organization` típussal.
  Nem következtettünk személynevet a hozzáférési fiókból.
- A még nem esedékes és piszkozat cikkek szűrése, az RSS és a naptár külön
  regresszióvédelme már létezett. Az aktuális buildben nincs rejtett cikk;
  a jövőbeli/piszkozat működést a meglévő fixture-tesztek is vizsgálják.

## Ellenőrzési bizonyítékok

- 96 indexelhető oldal, 60 cikkváltozat, 5984 belső hivatkozás, 704 kép.
- A helyi SEO-validálásban nincs hiba vagy figyelmeztetés.
- Az összes oldal legfeljebb három link követésével elérhető a magyar
  főoldalról, a nyelvváltást is figyelembe véve.
- 15 SEO-egységteszt, célzott TypeScript-ellenőrzés és 27 böngészős próba.
- A naptár 18 külön böngészős próbája és a két újabb mechanikai modell
  14 egységtesztje is sikeres.
- A forrás-összehasonlítás nem talált módosított cikket, naptáradatot vagy
  önálló widgetet. Az útvonalak, RSS-ek, ICS-ek, robots és biztonsági fejlécek
  változatlanok. A közös kiadói Instagram-hivatkozás miatt minden oldal
  Organization sémája bővült; ez szándékos metaadatváltozás.

Helyi naplók: `output/seo-p0-p1/`. A build a `validation.json` fájlt minden
futáskor újraírja; a CI 30 napos `seo-validation` artifactként is megőrzi.
A verziózott összefoglaló: [P0/P1 ellenőrzési adatok](seo/p0-p1-verification-2026-10-18.json).

## Nem ellenőrizhető, illetve külső hozzáférést igényel

- Search Console és Bing Webmaster Tools tulajdonjog, tényleges indexelés,
  kereső által választott canonical, AI-bevonási beállítás és forgalmi adatok.
  A repóban nem találtunk ellenőrzőkódot, de ez nem bizonyítja a fiók vagy
  DNS-alapú ellenőrzés hiányát.
- A `www.lumejournal.com` DNS-feloldása `ENOTFOUND`. A fő, nem www-s domain
  működik. A www kiszolgálása DNS-, tanúsítvány- és Cloudflare-beállítás;
  egy repóba tett átirányítás önmagában nem hozza létre.
- Valós látogatói CrUX/INP és organikus eredményváltozás nem volt mérhető
  ebből a hozzáférésből. A 75. percentilisre vagy forgalomnövekedésre nem
  közlünk kitalált értéket. Ezek a későbbi P3 mérési kör részei.
- A helyi sémateszt nem a Google Rich Results Test szolgáltatása, és nem
  igazol automatikus rich result vagy AI-megjelenési jogosultságot.

## IndexNow-döntés

IndexNow-integráció nem volt a projektben. A sitemap/RSS már működik, és nem
áll rendelkezésre igazolt Bing-indexelési késés. Ebben a P0/P1 körben nem
vezettünk be új, automatikus külső URL-beküldést. Ez nem technikai hiány
a Google-indexeléshez, és az IndexNow sem ad indexelési garanciát.
Az opcionális bekötés ellenőrizhető feltételeit a megvalósítási dokumentum
rögzíti. Ehhez nem szabad nem létező Google Indexing API jogosultságot feltételezni.
