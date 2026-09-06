# Lume: keresőoptimalizálás és ellenőrzés

## A 2026. szeptember 6-i fejlesztés

A meglévő szerkesztői címek, cikkek és URL-ek megmaradtak. Nem kerültek be mesterséges kulcsszólisták, vásárlói értékelések, kitalált szerzők, termékajánlatok vagy tömegesen generált márkaoldalak.

- A keresőcímek és leírások továbbra is a cikk `seoTitle` és `seoDescription` mezőiből készülnek. A főoldal címe most megnevezi az órás témákat is.
- Minden cikk saját, eredeti nyitóképből készített, legfeljebb 1200 pixel széles megosztási képet kap. Nem nagyítjuk fel az alacsony felbontású képet. Az Open Graph és Twitter-kártya ugyanazt a tartalmat mutatja.
- A `max-image-preview:large` engedélyezi a nagy kép-előnézeteket. Ez lehetőség, nem garantált Google Discover-megjelenés.
- A `BlogPosting` adatok és a látható szerzőjelzés a Lume kiadványt nevezik meg. Személynevet nem következtetünk ki a fióknévből. Saját névvel ellátott szerzői bemutatkozás később, a tulajdonos döntése alapján adható hozzá.
- Az opcionális `updated` csak érdemi tartalmi javítás dátuma. Nem cseréljük ki a cikk dátumát a build idejére. A dátum nélküli frissítési adatot nem találjuk ki.
- A canonical címek megmaradnak a saját domainen. A nyelvváltó rovatra mutató tartalékhivatkozását nem nevezzük fordításnak.
- A webhelytérkép az elkészült HTML-ből olvassa ki a valódi, kölcsönös HU/EN és `x-default` kapcsolatokat. Nem feltételezi, hogy az angol URL a magyar elé írt `/en/`.
- A `/cikkek/` és `/en/articles/` teljes, rovatokba rendezett cikkjegyzék. A HTML-ben minden megjelent cikk linkje benne van, JavaScript nélkül is. A helyi keresés nem hoz létre indexelhető találati URL-eket.
- A kapcsolódó cikkeknél a közös témák elsőbbséget kapnak a puszta frissességgel szemben. A forrás a `src/data/article-relations.json`.
- A 404 és az önálló `/widgets/` fájlok `noindex` jelzést kapnak. A modellek feltérképezhetők és a cikkben továbbra is működnek. A Cloudflare technikai aldomainjeire külön, domainhez kötött `noindex` szabály került; a saját domain nincs tiltva.
- A fontos helyi betűtípusok előtöltődnek, a CSS közvetlenül a HTML-ben érkezik. A négy Google Fonts-ot használó modell már a szülőoldallal közös helyi fájlokat tölti be. A Seiko Astron két nyelvi változatának öt eredeti képe bekerült az Astro reszponzív képfeldolgozásába. A korábbi publikus képcímek megmaradtak.
- A forrásjegyzék és a lábléc címsorai szemantikailag rendezettek. Az apró feliratok és linkek kontrasztja javult, a papír és a sötét háttér megmaradt.

## Automatikus védelem

```sh
npm ci
npm run build
```

A build végén automatikusan lefut az `npm run check:seo`. Így az éles feltöltés is meghiúsul, ha például:

- hiányzik vagy duplikált a cím, leírás, canonical vagy fontos megosztási metaadat;
- hiányzik egy kép, képméret, belső hivatkozás vagy belső horgony;
- nem kölcsönös a nyelvi kapcsolat, vagy mást mond a HTML és a sitemap;
- egy időzített cikk túl korán bekerül a kimenetbe, RSS-be, ajánlóba vagy cikkjegyzékbe;
- kimarad egy megjelent cikk a cikkjegyzékből vagy az RSS-ből;
- nincs összhangban a cikk látható címe, szerzőjelzése és strukturált adata;
- hiányzik a modellek helyi fontja, visszakerül a külső fontletöltés, vagy hibás a naptárfájl.

A `LAUNCHED=false` szándékos karbantartási állapot külön ellenőrzést kap. A hiányzó vagy kisebb nyitókép figyelmeztetés, mert a tartalomséma engedi a borító nélküli cikket is.

A mostani tartalmi állapotban 52 indexelhető oldal és 36 megjelent cikkváltozat szerepel, 6 jövőre időzített változat rejtve marad. Minden indexelhető oldal legfeljebb 3 hivatkozás követésével elérhető a magyar főoldalról; ebben a nyelvváltás is szerepel.

## A Google-fiókban maradó teendők

Ehhez a feladathoz nem állt rendelkezésre Search Console-hozzáférés vagy tulajdonosi ellenőrzőkód. Nem állítjuk, hogy a Google már feldolgozta az új változatot.

1. A tulajdonos Google Search Console-fiókjában legyen felvéve a `lumejournal.com` domain. Domain-tulajdon esetén a Google által adott TXT rekord kerül a DNS-be. Ellenőrzőkódot tilos kitalálni.
2. A Webhelytérképek résznél a `https://lumejournal.com/sitemap-index.xml` címet kell megadni.
3. Az URL-ellenőrzésben nézd meg a főoldalt, a cikkjegyzéket és néhány fontos HU/EN cikket. Ellenőrizd a kiválasztott canonical címet, a feltérképezést és a megjelenített képet. Az indexelési kérelem nem biztosít azonnali indexelést.
4. A Teljesítmény nézetben külön figyeld a magyar és angol oldalakat, a keresőkifejezéseket, a megjelenéseket és a kattintásokat. Csak ezek alapján érdemes a következő cím- vagy témamódosításról dönteni.
5. A méréskor a `https://www.lumejournal.com/` DNS-neve nem oldódott fel. A működő, canonical cím a `https://lumejournal.com/`. Ha a www-s változatot is használni szeretnéd, azt a Cloudflare-fiókban kell felvenni, érvényes HTTPS-sel és útvonalat megőrző 301-es átirányítással az alapdomainre. Egy repóba tett redirect önmagában nem hoz létre DNS-rekordot.

## Mire nem ad garanciát

A Lighthouse SEO-pontszáma ellenőrzőlista, nem helyezés és nem lefedettségi mutató. Jó technikai alapokkal sem lehet minden márkára és minden órára előre kerülni. A konkrét modellekről szóló, forrásolt és saját értéket adó cikkek, valamint a természetes hivatkozások bővítése adhat további növekedést. Olyan órákra nem készítünk üres céloldalakat, amelyekről nincs érdemi tartalom.

A függőségellenőrzés 5 meglévő jelzést adott (1 alacsony, 4 magas). Az oldal statikus, a szerveroldali Astro-kód nem fut az éles kiszolgáláskor, de ez nem teszi általánosan jelentéktelenné a buildeszközök figyelmeztetéseit. Az Astro főverziós frissítése külön, kompatibilitási próbát igényel; az SEO-feladat részeként nem futott kényszerített főverzió-váltás.

## Hivatalos háttér

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: fordítások és hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Article strukturált adatok](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: Discover és nagy képek](https://developers.google.com/search/docs/appearance/google-discover)
- [Google: navigációs útvonal](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Astro: sitemap integráció](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Cloudflare: statikus fejlécek](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Cloudflare: www átirányítás](https://developers.cloudflare.com/pages/how-to/www-redirect/)
