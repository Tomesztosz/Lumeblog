# Todd Beamer és az órája: szerkesztői jegyzetek

## Aktuális döntés: 2026. szeptember 14.

A tulajdonos a már megírt levélre még nem kapott választ, és kifejezetten
Beamer saját óráját tartalmazó hero használatát kérte, az engedélykérés
folyamatban lévő állapotának feltüntetésével. Ez szerkesztői publikálási
döntés, nem a jogtulajdonos engedélye. Az engedélykérés, a forrásmegjelölés
és az AI-háttér jelölése önmagában nem helyettesít felhasználási engedélyt.
A fotós személye és a továbbközlés jogalapja továbbra sincs igazolva;
a képet nem jelöljük közkincsnek, Creative Commons-licencűnek vagy engedélyezettnek.
Levelet ebben a körben nem küldtünk a tulajdonos nevében.

A kiválasztott `todd-beamer-hero-v1.webp` és `todd-beamer-card-v1.webp`
változtatás nélkül került a cikk képmappájába. Nem készült új AI-óra,
nem rajzoltuk át a dátumot vagy a sérüléseket. A törzsben a Brian Soergel-féle
emlékműfotó és a Norbert Pietsch-féle átlátszó hátterű típusszemléltetés maradt,
saját CC BY-SA 3.0, illetve 4.0 jelölésével. A különálló óráról továbbra is
egyértelműen leírjuk, hogy nem Beamer saját órája. Az ellenőrizetlen NPS-portré,
az eredeti vitrin-fotó és a kutatási makró nem kerül a nyilvános képek közé.

Hero-képaláírás, mindkét nyelven:

- HU: Órafotó forrása: Hodinkee. Montázs és a Flight 93-emlékhelyet idéző AI-háttér: Lume, nem archív felvétel. Az engedélykérés folyamatban van, válasz még nem érkezett.
- EN: Watch photograph source: Hodinkee. Montage and AI background evoking the Flight 93 memorial: Lume, not an archival photograph. Permission has been requested; no response has been received yet.

A kredit hivatkozása a [fotót közlő Hodinkee-írás](https://www.hodinkee.com/articles/remembering-911-through-the-rolex-that-is-frozen-in-time).
Ez a közlés forrása, nem kitalált fotóskredit. A forrásoldalt és a
[múzeum órát és dátumablakot említő írását](https://www.911memorial.org/connect/blog/childrens-911-tributes-display-flight-93-memorial)
ebben a körben újra ellenőriztük.

Mindkét nyelv `draft: false`, a közös időpont **2026. szeptember 16., szerda
05:00, Europe/Budapest**, vagyis `2026-09-16T03:00:00Z`.
Az időpont előtt egyik cikkoldal, listabejegyzés, RSS-elem vagy sitemap-URL sem
kerül a statikus buildbe. Az engedélyezett szerkesztői képek a build eszközei
között már a megjelenés előtt jelen lehetnek; ez nem privát képtárolás.
Az ütemező GitHub Actions-futása és a Cloudflare build késhet, az 05:00 nem
másodpercre garantált megjelenés. Az engedély megérkezésekor a feltételeket és
a kép alatti státuszt mindkét nyelven újra kell nézni.

### Fájlazonosság és ellenőrzés

- Hero SHA-256: `efb021cfa385f7b2d839c53f4c6d63eef5122a1960c8cc2e01f93c0fcf946e8b`.
- Kártya SHA-256: `0e70dcdfa098e3f8c0b247236075380259a3b7e66f455b85bb16d413ef381fd2`.
- A cikkellenőrző teszt az eredeti négy kijelölt képfájllal bájtszintű azonosságot vizsgál, továbbá ellenőrzi a látható engedélykérési feliratot és tiltja a CC-licenc átvitelét a heróra.
- A kivágott összehasonlító óra eredeti RGB-képpontjait ellenőrző teszt megmaradt.
- `npm run build`: sikeres, 75 oldal, 14 megosztható modelloldal, 0 hiba.
- `node scripts/check-article-review.mjs todd-beamer-rolex`: 2 időzített kézirat, 6 kép, 32 helyi erőforrás, 86 nyilvános HTML/XML-fájl, 0 hiba.
- A pénteki `ugro-masodperc` olvasópéldány ellenőrzése is sikeres, a cikk és az időpont változatlan.
- A helyi HU/EN olvasópéldány 390 és 1440 képpontos szélességen, világos és sötét módban ellenőrizve: 8 képernyőkép, a hero és a teljes státuszfelirat látható, vízszintes túlcsordulás nincs.
- Az időzítő cikkfelismerése 04:59:59-kor még hamis, 05:00:00-kor igaz mindkét nyelvre. A jelen idejű build mindkét későbbi cikkútvonalra 404-et ad.
- A két nyelvi naptár mobilon ellenőrizve, a meglévő 22 ICS letölthető és érvényes naptár-/eseményblokkokat tartalmaz.
- Az Astro fejlesztői szerver ebben a körben 30 másodperces indítási időkorlátba ütközött. A vizuális próba ezért a generált helyi olvasópéldányon történt; nem állítunk megjelenés előtti éles cikkoldalas böngészőtesztet.

A kötelező [naptárellenőrzés külön naplója](../calendar-review-2026-09-14.md)
rögzíti a teljes forráslista ellenőrzési kísérletét és a hiányos lefedettséget.
A régi feljegyzések alább történeti állapotok, nem az aktuális időzítés leírása.

## Előzmény: 2026. szeptember 13.

Ellenőrzés: 2026. szeptember 13. A tulajdonos jóváhagyta a bővített kéziratot
és a szeptember 16., szerda 05:00-s időpontot, Europe/Budapest szerint.
Mindkét kézirat dátuma `2026-09-16T05:00:00+02:00`, de a `draft: true` megmaradt.
Nincs aktív időzítés, feltöltés vagy élesítés. A hétfői Sea-Gull-cikk változatlan.

### Harmadik olvasópéldány: más forrásból származó képek

A tulajdonos a vitatott kép eltávolítását és más forrás használatát kérte.
Ez mindkét nyelvben megtörtént: a Hodinkee-ből származó múzeumi órafotó,
az azt tartalmazó v1 hero és az ellenőrizetlen jogállású NPS-portré kikerült
a kéziratból és az aktív előnézeti képmappából. A három régi előnézeti
fájl a `retired-preview-v1/` helyi archívumba került; visszakereshető,
nem töröltük véglegesen. A kutatási forrásfájlok szintén csak helyben maradtak.

Az új órafotó [Norbert Pietsch (Enpi48) saját munkája](https://commons.wikimedia.org/wiki/File:Rolex_Herrenuhr_Oyster_Perpetual_Datejust_mit_Turn-O-Graph_L%C3%BCnette_Gold_(1992).jpg),
CC BY-SA 4.0 alatt. A fotós 1992-es Datejust Turn-O-Graphként írja le.
Ez különálló, ép, római számos példány, nem Beamer órája, nem a sérült tárgy
rekonstrukciója. Az eredeti nyolcas dátum megmaradt, nem lett tizenegyre
átírva. A hero kreditje, alt szövege, a képet bevezető bekezdés és a képaláírás
magyarul és angolul is tisztázza ezt a különbséget.

A portrét [Brian Soergel: Todd Beamer WTC](https://commons.wikimedia.org/wiki/File:Todd_Beamer_WTC.jpg)
című, CC BY-SA 3.0 fotója váltja fel. A kép a New York-i emlékmű névpaneljét
mutatja 2014. március 9-én, nem a shanksville-i emlékhelyet. A törzskép
átméretezett WebP; a felirat nincs generálva vagy átírva.

Az új hero a két engedélyezett fotó eredeti részleteit kapcsolja össze egy
imagegennel készített papír- és tipográfiai háttéren. A külön órakép eredeti
RGB-adatokat használ AI-maszk alatt, valódi átlátszó háttérrel. A beépített
eszközt használtuk, CLI/API-fallback nélkül. A fotók kreditei, forrásoldalai,
eredeti licencei és az átdolgozás jelölése mindkét nyelvben olvashatók.
A kivágás és a montázs CC BY-SA 4.0; a törzsben szereplő emlékműfotó CC BY-SA 3.0.
A [Creative Commons útmutatója](https://certificates.creativecommons.org/cccertedu/chapter/3-3-license-types/)
igazolja a 3.0-ról 4.0-ra készített átdolgozás kompatibilitását.
Ez a képi átdolgozások licence, nem a teljes cikk automatikus átlicencelése.

Jelenlegi képek a `sources/` mappában:

- `todd-beamer-hero-v2.webp`: 1672 × 941, történetmesélő fotómontázs, nem archív együttállás.
- `todd-beamer-card-v2.webp`: 1200 × 900, a teljes kompozíciót megőrző kártyaváltozat.
- `beamer-comparison-turnograph-cutout-v2.webp`: 1960 × 2568, valódi alfa; az eredeti fotó szélen levágott részleteit nem egészítettük ki.
- `beamer-memorial-soergel-v2.webp`: 1400 képpont széles dokumentarista emlékműfotó.

Részletes [forrás- és licencnapló](../../output/article-review/todd-beamer-rolex/image-sources-v2.json),
[promptnapló](../../output/article-review/todd-beamer-rolex/image-prompts-v2.json),
[képi ellenőrzés](../../output/article-review/todd-beamer-rolex/image-checks-v2.json).
Előkészítő segédek: `scripts/prepare-beamer-replacement-sources.mjs` és
`scripts/prepare-beamer-replacement-images.mjs`. Az új változat nyolc fejezetes,
tizennégy forrással; az évfordulós felvezető és a bővített óratörténet megmaradt.

### Az aktiválás előtt még hátravan

Az új képi változat helyi átnézésre készült. A szerda 05:00-s, már kért
időpont megmaradt, de az átdolgozás nem jelent automatikus élesítést.
A szerdai publikálási naptáráttekintés nincs lezárva: a szabályokat és
a radar listáját elolvastuk, de a teljes hivatalos forráskört és a GitHub
ellenőrzőlistát ebben az aktiválási körben még nem ellenőriztük.
A `calendar-meta.json` változatlan. Az előkészítés nem teljesült időzítés.

## Előzmény: második olvasópéldány, szöveges visszajelzés

A felvezető most kimondja, hogy a szeptember 11-i évforduló adta a cikk apropóját.
A „múlt pénteken” a tervezett szeptember 16-i megjelenéshez igazodik, és mellette
szerepel a teljes 2026. szeptember 11-i dátum. Ez péntek volt, a támadások
huszonötödik évfordulója, nem a 2001-es nap hétköznapjának megjelölése.
A [múzeum évfordulós oldala](https://www.911memorial.org/connect/commemoration/25th-anniversary-commemoration)
igazolja az alkalmat. Ha a megjelenési hét változik, a relatív időmegjelölést
is át kell nézni; a dátum és a `draft: true` most változatlan.

Két új órás fejezet került mindkét nyelvbe: a Turn-O-Graph fejlődése és a
forgatható lünetta gyakorlati használata. További források:

- [Phillips, 6309](https://www.phillips.com/detail/rolex/CH080515/283): 1955-re datált tárgy, dátumos kialakítás; a Thunderbird elnevezés reklámtörténeti kapcsolata. A becenévből nem következik Beamer órájának katonai használata.
- [Christie's, 1996 körüli összehasonlító példány](https://onlineonly.christies.com/s/christies-watches-online-winter-holiday-sale/rolex-two-tone-thunderbird-turn-o-graph-datejust-ref-16263-273/64818?sc_lang=fr): acél/arany kivitel, Jubilee, automata 3135, az állapotjelentésben gyors dátumállítás. Nem állítjuk, hogy ezek Beamer órájának ellenőrzött adatai.

A húszas és harmincötös percjelzés közötti mérés saját szemléltető példa,
nem rekonstruált esemény. A képek, képkreditek és engedélyezési nyitott pontok
nem változtak. A bővített kézirat nyolc fejezetet és tizenkét forrást tartalmaz.

## Azonosítás és bizonyíték

- [A múzeum névjegykártya-rekordja](https://collection.911memorial.org/Detail/objects/56331/rel/1): C.2012.187.1, Oracle, Todd M. Beamer, account manager, a Beamer család ajándéka. A leírás szerint gyűrött, kopott, a jobb alsó sarka hiányzik. Az életrajzi rész igazolja a 32 éves kort, Cranburyt, a várandós feleséget és a kaliforniai üzleti utat. Ez a rekord a kártyáé, nem az óráé.
- [NPS-életrajz](https://www.nps.gov/people/toddmbeamer.htm): Beamer azonosítása, munkája és a dokumentarista portré forrása. A telefonkezelőn át közvetített utolsó üzeneteket is összefoglalja.
- [A múzeum hivatalos írása](https://www.911memorial.org/connect/blog/childrens-911-tributes-display-flight-93-memorial) megerősíti az óra és a tizenegyes dátum bemutatását. A cikk nem állít aktuálisan ellenőrzött kiállítási helyet, vitrinszámot vagy látogatási időt.
- [Hodinkee, Anthony Traina, 2024. szeptember 11.](https://www.hodinkee.com/articles/remembering-911-through-the-rolex-that-is-frozen-in-time): kétszínű Datejust Turn-O-Graph, tapestry számlap. Másodlagos szakmai azonosításként, kifejezetten neki tulajdonítva használjuk. Elsődleges múzeumi leltárból pontos referenciaszámot nem sikerült igazolni. Beamer saját órájához nincs biztos referenciaként megadott szám, kaliberszám, tokméret vagy vételár; az összehasonlító Christie's-példány külön szerepel.
- [Rolex történeti oldal](https://www.rolex.com/about-rolex/history/1926-1945): Oyster 1926, Perpetual rotor 1931, Datejust 1945. A nevek különböző funkciókat jelölnek, az Oyster Perpetual felirat önmagában nem pontos modellazonosító.
- [Phillips, korai Turn-O-Graph](https://www.phillips.com/detail/rolex/87345): 1953-as, 6202 referenciájú külön óra, forgatható beosztott lünettával. Kizárólag a típustörténet és a funkció példája, nem Beamer órájának specifikációja.
- [NPS, telefonhívások](https://www.nps.gov/flni/learn/historyculture/phone-calls-and-seating-chart.htm): Airfone/GTE, sikertelen kapcsolat a feleséggel, az üzenet közvetítése, a közös cselekvés terve. Az oldal megkülönbözteti a felvételeket az FBI-interjúkból ismert tanúbeszámolóktól. A rövid „Let's roll” idézet telefonkezelői visszaemlékezés, nem Beamer nyilvánosan igazolt hangfelvétele.
- [9/11 Commission Report, 1. fejezet](https://www.9-11commission.gov/report/911Report_Ch1.htm): az ellentámadás 9:57-kor indult; a gépeltérítők a kormánynál maradtak és a földbe vezették a gépet. A becsapódás ideje 10:03:11, a cikkben perc pontossággal, helyi időként. Radar, adatrögzítők és más vizsgálati adatok igazolják, nem a sérült karóra mutatói.
- [NPS, Flight 93](https://www.nps.gov/flni/learn/flight93nps.htm): az emlékhely a 40 utasnak és személyzeti tagnak állít emléket. A négy gépeltérítő nem része ennek a számnak. A cikk nem tulajdonítja egyetlen embernek a kollektív ellenállást.

## Szándékosan kimaradt állítások

Nem bizonyított, hogy Beamer a lünettával időzített volna, vagy az órájára nézett
volna az ellenállás közben. Nincs állítás arról, hogy az óra a becsapódás után
járt, pontosan akkor állt meg, vagy a mutatói rekonstruálnák az eseményeket.
Nem adunk kitalált vásárlási vagy családi öröklési történetet. Az eredeti New York
Times-anyag közvetlenül nem volt olvasható; nem kezeljük elolvasott forrásként.
A múzeum konkrét restaurálási döntéseiről nincs ellenőrzött adat: a megőrzésről
szóló zárófejezet szerkesztői értelmezésként van megfogalmazva.

## Archív v1: korábbi képi szerepek és nyitott jogosultságok

Az alábbi v1 leírás munkanapló, nem a jelenlegi képi változat. Ezek a képek
a harmadik olvasópéldányban már nem szerepelnek, publikálásra nem használhatók.

A korábbi helyi referenciafájlok az
`output/article-review/todd-beamer-rolex/sources/` mappában vannak.

| Fájl | Szerep és eredet |
| --- | --- |
| `todd-beamer-hero-v1.webp` | 1672 × 941-es történetmesélő montázs. Eredeti órafotó, külön AI-háttér a Flight 93-emlékhely tájával. Nem archív kép, a helyszín nem dokumentarista reprodukció. |
| `todd-beamer-card-v1.webp` | 1200 × 900-as kártyaváltozat, a teljes kompozíciót megőrző papírszínű kiegészítéssel. |
| `beamer-watch-cutout-v1.webp` | 377 × 910-es, valódi alfa csatornás kivágás. Az eredeti óra RGB-képpontjai megmaradtak, nincs generált számlap vagy kijavított sérülés. |
| `beamer-portrait-nps.webp` | Valós, az NPS életrajzi oldalán azonosított portré. Dokumentarista kép, ezért nem vonatkozik rá az önálló óratermék-képek kivágási szabálya. |

A beépített imagegen eszköz két kimenetet készített: regisztrált kivágómaszkot
és külön szerkesztői hátteret. A maszk az eredeti fotó színadataira került.
CLI/API-fallback nem történt. A teljes promptok, bemenetek és kimeneti utak a
[promptnaplóban](../../output/article-review/todd-beamer-rolex/image-prompts-v1.json)
szerepelnek. A reprodukciós segéd a `scripts/prepare-beamer-editorial-images.mjs`;
verziózott kimeneteket használ, nem általános felülíró parancs.

Az eredeti óraképen kiállítási rögzítések takarnak egyes részleteket.
Ezeket a takarásokat nem helyettesítettük kitalált órarészekkel. A tárgy körüli
háttér és a fémszíj közti rések átlátszók; az átfedő rögzítés helyenként látszik.
Az önálló kivágást világos és sötét háttéren is megnéztük. A teljes hero és a
4:3-as változat vizuális ellenőrzése is megtörtént.

Az órafotó a Hodinkee oldalán közölt múzeumi felvétel, a fotós és a
nyilvános újraközlés joga nincs igazolva. Az NPS-portré esetén sem feltételezzük,
hogy a családi fotó az oldal gazdája miatt automatikusan közkincs.
A helyszínreferencia NPS/Wagner kreditű képet tartalmazó tájékoztató grafika;
az intézményi emblémát és feliratokat nem használtuk fel a heróban.
A [múzeum feltételei](https://www.911memorial.org/terms-use-privacy-policy)
nem jelentenek általános engedélyt a nyilvános újraközlésre.
Képengedély még tisztázandó, ilyen engedélyt nem állítottunk és nem kértünk
a tulajdonos nevében külső félnek írt üzenettel.

A külön dátumablak-makró és az eredeti teljes vitrin-fotó helyi kutatási referencia,
nem szerepelnek önálló képként az olvasópéldányban.

## Ellenőrzés és publikálási határ

- `npm run build`: sikeres. 59 oldal, 42 nyilvános cikknyelvi változat, 22 ICS, 66 CSP-védett HTML; a szokásos naptár-, SEO-, biztonsági és folyóirat-tesztek sikeresek.
- `node scripts/check-article-review.mjs todd-beamer-rolex`: 2 piszkozat, 0 időzített cikk, 6 kép a két előnézetben, 32 helyi erőforrás-ellenőrzés, 70 publikus HTML/XML-fájl ellenőrzése, 0 hiba.
- A Beamer-képek a végleges buildben sem fájlként, sem kézirathivatkozásként nem szerepelnek. Az első helyi build megmutatta, hogy az Astro `cover.src` mezője szűrt piszkozatból is kibocsátja az eredeti képet. A helyi export ezért külön `reviewCover` mezőt használ, a törzsképek `lume-review-image` megjegyzések. A második build és a privátképkizárási teszt igazolta a javítást. Egyik buildet sem töltöttük fel.
- A v2 kivágás 3 459 678 teljesen átlátszatlan képpontját az eredeti fotóval összehasonlító tesztben az RGB-eltérésszám 0. Az eredeti maszkon 2 898 317 teljesen átlátszó képpont van. A végső kivágás külső 24 képpontos kerete átlátszó. Részletes méretek és SHA-256: [képi ellenőrzés v2](../../output/article-review/todd-beamer-rolex/image-checks-v2.json).
- A v2 hero és a 4:3 kártya, valamint a kivágás világos és sötét hátteres változata vizuálisan ellenőrizve. A teszt tiltja a régi órafotó, portré és v1 hero visszakerülését az előnézetbe, és mindkét Creative Commons-licenc linkjét ellenőrzi.
- A hétfői olvasópéldány változatlan tesztje is sikeres: 2 időzített kézirat, 12 előnézeti kép, 38 helyi erőforrás, 0 hiba.
- Nincs tiltott hosszú gondolatjel az új kéziratokban; mindkét nyelvhez források, alt szövegek és eredetjelölések tartoznak.
- Böngészős kattintásos vagy mobil-képernyőképes próbát ebben a körben nem végeztünk. Az ellenőrzés a képfájlok vizuális áttekintésére és a HTML/CSS, hivatkozások, méretek, nyelvek, helyi erőforrások statikus vizsgálatára terjedt ki.

Publikálás előtt az új képi változat átnézése, az előnézeti képjelölések explicit
átvezetése és a kért szerda 05:00-s időzítés aktiválása kell.
Utána az AGENTS.md szerinti teljes szerkesztői naptárellenőrzés is kötelező.
Most csak a naptár technikai tesztjei futottak; a `lastReviewed` mező nem változott.
