# Megjelenési naptár és újdonságfigyelő

## Célzott év végi frissítés: 2026. október 18.

A 24 figyelt márka nyilvános forrásainak célzott átnézése 2026. december 31-ig:
nyolc új, hónapra igazolt esemény és három dátumra váró bejegyzés került be.
Október: Citizen Series 8 és The CITIZEN kiadások, Grand Seiko Hi-Beat,
Seiko Edo-lila jubileumi család, Kurono Calendrier SBR kiszállítás.
November: Citizen ATTESA EVER SINCE és a Seiko két pandás kronográfja.
December közepe: C1 Loco Classic, kizárólag az ellenőrzött aranyszínű
számlapos, barna bőrszíjas referencia várható teljesítése.

A Baltic The Rift évszám nélküli októberi szállítása, a Farer Stratton
hónapra nem pontosított 2026 végi visszatérése és az MR-G MRG-D5000
értékesítése dátumra vár. Ezekből nem készül ICS. A már elfogyott Kurono
rendelési ablaka nem zárja le a későbbi kiszállítást. A négy korábbi,
migrációkor felülvizsgálandó bemutató a részletes hivatalos oldalak újabb
ellenőrzése után kapott eseményszintű bemutatási bizonyítékot. Előző
ellenőrzési állapotuk megmaradt az előzményekben.

A forráslefedettség részleges. A TAG Heuer termékoldal botvédett, a Cartier
katalógusának lapozott része és a Longines dinamikus híroldala nem teljesen
ellenőrizhető; hivatalos alternatív sajtóforrásokat is átnéztünk. Az IWC,
JLC, Longines és TAG Heuer hivatalos sajtó-/magazinoldala, valamint a Casio
híroldala bekerült a napi radarba. A teljes történeti feldolgozási sor nem
ürült ki. A `lastReviewed` változatlan maradt, a külön `lastTargetedReview`
jelzi ezt a részleges, konkrét tartalmi frissítést a felületen is.

Tételes források, idézetek, képeredet, márkánkénti megjegyzések és nyitott
kérdések: [ellenőrzési napló](calendar-review-2026-10-18.json).

## Aktuális működés: 2026. október 18.

Ez a szakasz felülírja az alább megőrzött szeptemberi működésleírást.
A megoldás továbbra is fájlalapú Astro-oldal, GitHub Actions időzítővel és
Cloudflare statikus kiszolgálással. Új szolgáltatás és titkos API-kulcs nem kell.

### A javított problémák

- A korábbi `phaseFor` az eltelt időszakot és a `completedOn` állítást egyaránt
  `archived` állapotba sorolta, eseményszintű bizonyíték nélkül.
- Az ismeretlen dátumú terv 30 nap után archívumba került, pusztán a forrás kora
  miatt. Most dátumra vár, az ellenőrzési igény ettől külön jelzés.
- A `focusEntry` nem kapta meg a szűrőket, és átfedő hónapokból önkényesen egy
  eseményt választott. Most a szűrt, közös besorolásból csoportos kiemelés készül.
- A dátumlogika csak napot/hónapot ismert; a Lorier pontos nyitása és a Mantis
  tényleges rendelési időablaka napos eseményként szerepelt.
- Az ICS minden tervet megerősítettként exportált. A becslés most TENTATIVE,
  és az export kifejezetten jelzi, hogy teljes időablakról van szó.
- A forrásfigyelő linket és szöveghash-t követett, nem eseményállítást. A
  fájlmentés közvetlen felülírás volt, feltételes HTTP és zárolás nélkül.

### Közös állapot és felület

`src/lib/calendar-events.mjs`: `classifyCalendarEvent(event, now, config)`.
Egy feldolgozás ugyanazt a `now` értéket használja. A kategóriák: `private`,
`future`, `current`, `awaiting`, `review`, `expired`, `occurred`, `cancelled`.
Az utóbbi kettő csak az adott azonosítóhoz és eseménytípushoz tartozó,
elfogadott bizonyítékkal állítható. Egymásnak ellentmondó kimenetelek: `review`.
Készletállapotból sem megjelenést, sem kiszállítást nem következtetünk.

Az Aktuális nézet csak `future` és `current`. A Korábbiak megkülönbözteti a
lejárt, nem igazolt tervet a ténylegesen megtörtént és a visszavont eseménytől.
A dátumra várás és a feloldatlan ellentmondás külön nézetet kapott.
A számok eseményeket számolnak, nem egyedi órákat. A márkaradar számai az
adott márka összes aktuális eseményét mutatják, nem a teljes katalógusát.

`calendar-state.mjs` erre építi a szűrést, rendezést, címkéket és kiemelést.
`DesignCalendar.astro` és `calendar-client.ts` ugyanazokat a függvényeket hívja.
A kliens betöltéskor, a következő időhatáron, legfeljebb percenként és háttérből
visszatérve újraszámol. A külön verzióellenőrzés ötpercenként, illetve
visszatéréskor újraépített adatok esetén újratölti az oldalt. Hibája nem állítja
le az időalapú működést. A naptár HTML és ICS újraérvényesítendő, a
`calendar-revision.json` nem cache-elhető. JavaScript nélkül buildkori állapot
és az összes jóváhagyott rekord olvasható; privát jelölt nincs a HTML-ben.

### Adatmodell és veszteségmentes migráció

Az eredeti `releases.json` és `announcements.json` változatlan tartalmi
alapréteg. Az új `calendar-events.json` azonosító alapján kapcsolódó,
elsődleges életciklusréteg: `identity`, `editorial`, `sourceStatus`, `schedule`,
`verification`, `evidence`, `revision`, `history`. A HU/EN szöveg továbbra is
egy közös rekordhoz tartozik. A render, frissítő és export `hydrateEvents`
segítségével kapja ugyanazt az elfogadott eseményt.

Az identitás márka, modell/referenciák, eseménytípus, piac, kiadás és kör
együttese. A dátum nem része. Régi, nem teljesen dokumentált identitásnál a
`legacy:<eredeti-id>` körkulcs megakadályozza a veszteséges összevonást, de
nem állít új piaci tényt. `identityVerified: false` mellett nincs automatikus
átírás. Az új kör külön azonosítót és szerkesztői jóváhagyást igényel.

`npm run calendar:migrate` egyszeri, additív migráció. Létező célfájlt nem ír
felül. Megőriz mind a 17 azonosítót és az eredeti fájlokat, szöveget, forrást,
pontosságot, külön Lorier-köröket és szerkesztői döntéseket. A korábbi,
idézett eseménybizonyíték nélküli `introduced` címkét ellenőrzési igényként
kezeli, nem gyárt utólagos teljesülési bizonyítékot. A migráció nem írja át
a radar `lastReviewed` mezőjét.

A migráció után külön, 2026-10-18-i forrásellenőrzés történt a Lorier és RÁTH
oldalán. A Lorier továbbra is december végi szállítást becsül; a készlethiány
nem zárja le. A RÁTH korábbi szeptember/október ellentmondása már nem látható,
a két szövegrész októbert, illetve október végét mond. Az elfogadott terv
októberre változott, az előző terv és az ellentmondás a history-ban megmaradt.
Források: https://www.lorierwatches.com/products/watch-astra-white-nodate-bracelet-278081
és https://rathwatches.com/products/rath-droma-gmt . Ez két konkrét ellenőrzés,
nem teljes radaráttekintés.

### Dátumok és export

A `schedule.precision` lehet `instant`, `day`, `month`, `quarter`, `range`,
`duration`, `unknown`. Pontos időhöz explicit offset és forrás-időzóna kell,
az eltérés hibának számít. Dátumalapú közlésnél a hiányzó időzóna belső
helyettesítője Europe/Budapest. Ebből nem lesz gyártói pontos időállítás.
A nap/hónap vége a következő helyi naptári határ, DST-vel együtt, nem 24 óra.
A `duration` valódi nyitvatartás, a többi időszak alapértelmezésben bizonytalan
bekövetkezési ablak. A hónap vége jelző és a becslés megmarad, napot nem adunk
hozzá. Az eredeti dátumszöveg `originalText`; régi, idézet nélküli adatnál null,
a régi szerkesztői dátumfelirat külön `legacyLabels`. Nem nevezünk fordítást
eredeti gyártói idézetnek.

A `calendar-ics.mjs` ugyanebből exportál. Hónap/negyedév/intervallum teljes
átlátszó, TENTATIVE ablak, nem első napi megjelenés. Pontos idő UTC instant,
valódi rendelési időszak kezdettel és véggel. UID stabil, SEQUENCE a jelentős
módosítás verziója. Dátumra várás és konfliktus esetén nincs új ICS; a lezárt
tervek letöltőgombja eltűnik, történeti exportjuk megmaradhat. Visszavonásnál
a még dátumozható export CANCELLED. Egy korábban letöltött fájl nem előfizetés:
nem tudjuk távolról törölni vagy frissíteni a látogató saját naptárában.

### Forrásfeldolgozás és biztonságos mentés

Három egymástól független folyamat:

1. Napi felderítés: `npm run radar:check`, a meglévő 24 márka elsődleges és
   további forrásai, valamint ismert részletes termékoldalak. Link, publikációs
   dátum és szöveghash, nem automatikus megjelenési dátum.
2. Ismert események: `npm run calendar:refresh`. URL-enként egy lekérés,
   ellenőrzött forrásszerződés alapján kinyert állítás, identitás- és
   bizonyítékellenőrzés, összehasonlítás, elfogadás vagy ellenőrzési feladat.
3. Időalapú besorolás: közös tiszta függvény, hálózat és scraper nélkül.

A forrásszerződések és gyakoriságok: `src/data/calendar-refresh.json`.
Jelenleg két ellenőrzött kötés működik, RÁTH Founder Series és a Lorier
decemberi kiszállítás. A többi oldal változásfigyelést és kézi feldolgozási
feladatot kap, nem általános, bizonytalan szövegbányászati átírást. A Lorier
kötés szándékosan a mostani kör ismertetőjéhez kötött: eltűnése új kört is
jelenthet, ezért ellenőrzést kér. Az explicit évet nélkülöző hónap nem elég.

Megváltozott terv automatikus elfogadásához azonos, ellenőrzött identitás,
engedélyezett hivatalos URL, rövid állításidézet, az elfogadott revízióra
hivatkozás és egyértelműen újabb, explicit időbélyegű gyártói helyesbítés kell.
A `correctionPattern` opcionális forrásspecifikus szerződés, nem általános
HTTP Last-Modified vagy letöltési idő. A jelenlegi két termékoldal nem ad
ilyen megbízható helyesbítési időbélyeget, ezért új dátumuk ellenőrzésre kerül.
Egyértelműen változatlan állítás automatikusan frissíti a szemantikai
ellenőrzést. Egymásnak ellentmondó kinyert dátumok kizárják az Aktuális nézetet,
de nem írják felül az utolsó elfogadott tervet.

Az eseményenkénti `outcomes` szabályokkal teljesülés, visszavonás és halasztás
is kinyerhető, ha a gyártóhoz ellenőrzött szabály rendelkezésre áll. A jelenlegi
kötésekhez ilyen szabályt nem találtunk biztonságosan megadhatónak, ezért nem
következtetünk általános „available” vagy „sold out” szavakból.

Az elfogadott adat és előzménye egyetlen atomi JSON-cserével mentődik, kizáró
fájlzár alatt. Revízió- és kérésidő-ellenőrzés védi a régi válaszok ellen.
A változatlan érdemi adat nem növeli a revíziót vagy a history-t. A napi
szemantikai frissesség külön metaadat; órán belüli ismétlés a privát cache-be
kerül. Az `override` és a nem jóváhagyott rekord védett az automatikától.
Hálózati hiba, 404, blokk, üres válasz vagy parserhiba nem módosít elfogadott
eseményállapotot. A source hash és cache elvesztése új ellenőrzést okoz,
nem törlést. Elakadt `.lock` fájlt csak a folyamat leállásának ellenőrzése után
szabad kézzel eltávolítani; az automatika nem lopja el a zárat.

Külön idők: URL-szintű `lastAttemptAt`, `lastSuccessfulFetchAt`; eseményszintű
`semanticVerifiedAt`; változatlan szerkesztői `editorialReviewedAt` és a teljes
radar `lastReviewed`. Sikeres HTTP nem frissíti az utóbbi kettőt.

### Üzemeltetés

```sh
npm run check:calendar
npm run calendar:refresh -- --dry-run --force
npm run calendar:refresh
npm run radar:check
npm run build
node scripts/check-calendar-browser.mjs
```

A dry-run csak jelentést ír, elfogadott adatot és működési cache-t nem.
A force a gyakorisági ellenőrzést hagyja ki, a bizonyítékellenőrzést nem.

Az új `.github/workflows/calendar-events.yml` óránként, :37 UTC-kor ébred.
Az egyes forrásokat csak esedékességkor kéri: távoli esemény 24 óra, egy héten
belüli pontos esemény 6 óra, 24 órán belüli pontos esemény és friss lejárat
1 óra. Tartós rendezetlenségnél 7 napos ütemre ritkul; hibánál exponenciális,
legfeljebb 168 órás visszalépés. A konfigurációban módosítható.
A napi felderítő változatlanul 01:17 UTC-kor fut. ETag/Last-Modified feltételes
kérések és szöveghash, 1,5 másodperces forrásközi minimum, 25 másodperces
timeout, 8 MB-os válaszkorlát és csak regisztrált HTTPS-hostok használhatók.

Az órás workflow csak elfogadott adatváltozás vagy a legutóbbi commit óta
bekövetkezett időhatár esetén buildel és commitol. A commit és push kizárólag
`calendar-events.json`-t érinthet, vagy üres időhatár-commit. Push előtt teljes
build kell. Nem fast-forward push esetén megáll, nem erőlteti át és nem
rebase-eli a forrásállítást. Következő futás új állapotból indul.
A cikkidőzítővel közös concurrency-csoport védi az automaták írásait.

Naplók: `.calendar-radar/event-report.json`, `event-state.json`, illetve a
GitHub `calendar-event-report` artifact, 90 napig. A napi radar az eseményes
ellenőrzési feladatokat is betölti a meglévő GitHub-listába. A kézi zárkezelés,
a sikertelen Actions-futások és a tartós felülvizsgálati sor üzemeltetői feladat.
A workflow a repó szokásos GITHUB_TOKEN-jét használja, contents:write joggal;
a napi issue-hoz továbbra is issues:write kell. Külön környezeti változó nem
kell. A `CALENDAR_PREVIOUS_TIME` csak az időhatár-ellenőrzés explicit korábbi
időpontja, nem gyártói dátum.

Éles működéshez ezeket a fájlokat a main ágra kell kiadni, és a GitHub Actions
írási jogának, valamint a meglévő Cloudflare Git-integrációnak működnie kell.
A GitHub/Cloudflare futások késhetnek; a kliens lejárati logikája ezt nem várja.
Az offline látogató új gyártói információt nem kaphat, de a már ismert terv
lejáratát továbbra is helyesen számolja. Ez a változtatás önmagában nem push
és nem élesítés.

### Ellenőrzések

28 offline teszt a naptárra és forrásfeldolgozásra, köztük a feladat mind a
14 megadott esete. Rögzített időpont, Budapest/New York, 23 és 25 órás DST-nap,
hónap/évhatár, bizonyítékfajták, új kör, idempotencia, párhuzamos zár, régi válasz,
feltételes HTTP és hibás válaszok. 18 böngészős ellenőrzés HU/EN, mobil,
szűrés, kiemelés, régi direkt link, offline időhatár, bfcache-szerű visszatérés,
JavaScript nélküli tartalom és CSP. A teljes build az ICS-, SEO-, biztonsági,
napló- és modellvizsgálatokat is futtatja.

## Korábbi működésleírás: 2026. szeptember 14.

A naptár alapnézete a még aktuális és a közelgő, hivatalosan dátumozott
eseményeket mutatja. A lejárt órák nem maradnak benne két hónapig, a dátum
nélküli bemutatók sem maradnak örökre újak.

| Nézet | Mi látható benne? | Mikor kerül ki belőle? |
| --- | --- | --- |
| Előttünk | Aktuális vagy jövőbeli dátumos esemény | A hivatalos időszak után, illetve igazolt korai lezáráskor |
| Friss, 14 nap | Nálunk felvett bemutatók és lezárult események | A `firstSeen`, illetve lezárási nap óta eltelt 14. napon |
| Dátumra vár | Hivatalos, még nem dátumozott bejelentés | Dátum rögzítésekor, vagy 30 napnál régebbi forrásellenőrzés után |
| Archívum | Régi bejegyzések és újraellenőrzésre váró dátum nélküli hírek | Nem töröljük őket, kereshetők maradnak |

A bemutató `firstSeen` mezője nem állítható át csak azért, hogy frissnek tűnjön.
A `sourceChecked` frissítése nem tesz újra újdonsággá egy régi bejegyzést.
14 napnál régebbi forrásellenőrzésnél a kártya külön figyelmeztetést mutat.
A hónap pontosságú jelzés nem jelenti, hogy az óra már biztosan megjelent.

A dátumos rekord opcionális `eventType` mezője `launch`, `preorder` vagy
`delivery`. Ez a kártyán és az ICS címében is különbséget tesz bevezetés,
rendelési ablak és kiszállítás között. A `completedOn` opcionális mező csak
hivatalos forrással igazolt, a `sourceChecked` napjáig bekövetkezett lezárásra
használható. Nem találgatás és nem készletjelző. Hónapos eseményt is lezárhat
korábban, a korábban kiadott ICS eredeti időablakát nem írja át hamis napra.

Az egységes `calendar-state.mjs` számolja a szerver, a böngésző és a napi
újraépítés állapotait. Budapest szerinti napváltással működik. A nyitott lapon
percenként, visszatéréskor és böngészős visszanavigáláskor frissül a sorrend,
a jelölés, a darabszám, az ajánlott esemény és a lejárt naptárletöltés láthatósága.
Az új tartalomhoz továbbra is jóváhagyott adat és új build kell. Az óra
előrehaladása önmagában nem tud új terméket létrehozni.

A szűrők az URL-be kerülnek, így például a `/naptar/?brand=seiko&status=recent`
link megosztható. A régi `#modell-azonosito` hivatkozás az archív kártyát is
felfedi. JavaScript nélkül minden rekord megmarad olvashatónak, buildkori állapottal.

## Előzmény: 2026. szeptember 6.

A naptár korábban csak jövőbeli, legalább hónapra dátumozott megjelenéseket
fogadott be. Az azonnal bemutatott modellek, például a Christopher Ward C60
Trident Biscay, emiatt kimaradhattak. A napra pontos események másnap eltűntek
az alapnézetből. Az időzítő csak újraépítette az oldalt, nem keresett híreket.

Az új rendszer két, egymástól elkülönített adattípust kezel:

- `src/data/releases.json`: igazolt nap- vagy hónap-pontosságú események.
  Lehet bevezetés, rendelési ablak vagy kiszállítás; a szövegben meg kell mondani,
  melyikről van szó. Csak ezekből készül ICS. A lejárt időszak nem bizonyít készletet.
- `src/data/announcements.json`: hivatalosan bemutatott (`introduced`) vagy
  dátumra váró (`announced`) újdonságok. Nincs mesterséges `date` mező, nincs ICS.
  A `firstSeen` a Lume felfedezésének napja, NEM a gyártói megjelenés időpontja.

Mindkét típushoz magyar és angol szöveg, hivatalos forrás, forrásellenőrzési nap,
helyi eredeti kép és képkredit kell. A teljes modellcsalád összevonható, de ezt
a kártya nevéből és szövegéből egyértelművé kell tenni. A számlapszínek és
szíjvariánsok nem feltétlenül külön bejelentések.

A korábbi, 60 napos alapnézetet a fenti életciklus váltja fel. A bemutatott,
dátum nélküli kártyák nem kapnak hamis „ma megjelent” címkét. A márkaválasztó
mind a 24 figyelt márkát tartalmazza, üres találatnál sem állítja, hogy nincs újdonság.
A kliens és a szerver közös, Budapest-időzónás dátumlogikát használ.

## Napi felderítés és szerkesztői munka

`npm run radar:check` végigkéri a radar elsődleges és további hivatalos forrásait,
valamint a nyilvános kártyák részletes forrásoldalait is.
Új belső hivatkozásokat, szövegváltozásokat, hibákat és részleges tartalmat jelez.
Ez nem AI-hírszerkesztő és nem ígér teljes katalóguslefedettséget. JavaScriptből
betöltött kínálatot, csak hírlevélben megjelenő bejelentést vagy botvédett forrást
önmagában nem tud teljes körűen ellenőrizni.

A `Naptár forrásfigyelő` GitHub Actions munkafolyamat naponta 01:17 UTC-kor fut,
így hétfőn, szerdán és pénteken is. Kézzel is indítható. A GitHub időzítése késhet.
Egy állandó GitHub issue-ban vezeti a feldolgozandó listát, nem hoz létre naponta
új feladatot. A teljes JSON-jelentés és az összehasonlítási állapot 90 napig
letölthető artifactként. A cache a következő futás alapja; elvesztése új alaplistát
eredményez, nem hamis „nincs változás” választ.

Állapotok:

- `readable`: szöveg és jelölthivatkozások kinyerhetők. NEM teljes emberi ellenőrzés.
- `partial`: hiányos tartalom vagy nem kinyerhető linklista, böngészős ellenőrzés kell.
- `failed` / `blocked`: nem olvasható forrás, nem lehet belőle negatív következtetést levonni.
- `baseline`: első sikeres letöltés. A jelöltek között korábbi modellek is szerepelnek.
- `changed`: a szöveg módosult, az új linkek mellett a régi kártyák adatait is ellenőrizni kell.

A figyelő nem csak hozzáfűz egy több száz soros, időrend nélküli linklistához:

- Megőrzi a hírfolyamból kapott `publishedAt` közleménydátumot, de ebből soha
  nem készít megjelenési dátumot vagy ICS-t.
- Előre veszi az elmúlt 30 nap gyártói közleményeit és az alaplista után
  valóban újonnan észlelt linkeket. Az utóbbiaknál az újdonság még ellenőrizendő.
- Összevonja a követőkódos, záró perjeles és a Seiko/Grand Seiko azonos
  sajtóközleményének nyelvi/régiós URL-változatait. A modellváltozatokat nem
  vonja össze önkényesen.
- A régi hírek, katalógus- és navigációs linkek külön háttérnézetbe kerülnek.
  Ez nem elutasítás, a rekordok megmaradnak.
- Naponta legfeljebb 20 új jelöltet emel ki, márkánként legfeljebb hármat.
  A teljes sor külön is elérhető, a korlát nem adatvesztés.
- A már felvett órák forrásváltozását akkor is jelzi, ha nincs új hivatkozás.
  A változásjelzés nem feltétlenül új termék: szöveg, ár és készlet is változhatott.

A helyi, olvasható szerkesztői munkalista: `.calendar-radar/megnezes.html`.
A gépi JSON: `.calendar-radar/report.json`. Mindkettő a GitHub Actions
`calendar-radar` artifactjában is megjelenik. Nem kerülnek a nyilvános webhelyre.
A napi GitHub issue rövidített feladatlista, a jelölőnégyzet nem publikálógomb.

Forrásváltozás ellenőrzése után a `src/data/calendar-source-reviews.json` fájlba
az ellenőrzött `url`, a jelentésből átvett pontos `hash`, a `reviewedAt` nap és
az érdemi `reason` kerül. Ha a kártya adata változott, azt külön is frissíteni
kell a `sourceChecked` mezővel együtt. Egy korábbi hash jóváhagyása nem rejti
el az oldal következő változását. Gépi hibából nem születik ilyen jóváhagyás.

Az ellenőrizetlen hivatkozások sorban maradnak akkor is, ha másnap nincs változás
vagy a forrás nem érhető el. Feldolgozáskor:

1. Olvasd el a hivatalos részletes termék- vagy sajtóoldalt. A keresési találat és
   a nyitóoldali „new” jelvény nem feltétlenül mutat valós megjelenési dátumot.
2. Hasonlítsd össze a nyilvános bejegyzésekkel; az azonos forrás mögött több óra is lehet.
3. Vedd fel vagy frissítsd a megfelelő adattípust. Ha már van hiteles dátum,
   az announcement kerüljön át a releases fájlba, ugyanazzal az azonosítóval.
4. Elutasítás vagy duplikáció esetén rögzítsd az URL-t, `decision` értékét
   (`excluded` / `duplicate`), `reviewedAt` dátumát és `reason` indoklását a
   `calendar-decisions.json` fájlban. A gépi találat nem automatikus elutasítás.
5. A korábban feldolgozott források változásait és a sikertelen forrásokat is nézd át.
6. A teljes radar emberi áttekintése után frissíthető a `calendar-meta.json`
   `lastReviewed` mezője. Egy futás dátuma ezt nem írhatja felül.
7. Futtasd az `npm run build` parancsot és ellenőrizd mindkét nyelvet, képeket,
   szűrőket, sötét módot, ICS-letöltéseket.

Az automatika sem cikket, sem naptárkártyát nem publikál ellenőrzés nélkül.
Az újraépítés és az új bejelentések szerkesztői feldolgozása két külön művelet.

## Az első javítás ellenőrzési köre

2026-09-06: 24 márka 41 hivatalos URL-jének gépi próbája. 27 olvasható,
4 részleges, 10 sikertelen forrás. Öt új nyilvános kártya hivatalos részletes
forrásból: Biscay család, Rolex Oyster Perpetual 41, Tudor Northflag, Citizen
SKYHAWK és TSUNO CHRONO évfordulós kiadások. Ez nem a teljes 2026-os kínálat
visszamenőleges feldolgozása. A többi jelölt további szerkesztői ellenőrzést igényel.

A korábbi `lastReviewed` értéket nem módosítottuk gépi futásra hivatkozva.

A próba alapján külön javítás készült a Christopher Ward nagy HTTP-fejléceinek
fogadására: csak a felderítő parancs kap 64 KiB-os, továbbra is véges korlátot.
A TLS-ellenőrzés változatlan. A Seiko és Grand Seiko dinamikus hírlistájához
felvettük azt a nyilvános JSON-adatforrást is, amelyet a saját oldaluk használ.
A radar így 43 forrásra bővült. Az API hírközlési dátumai nem válnak automatikusan
termékmegjelenési dátumokká.

A javítás utáni 43 forrásos próba eredménye: 32 olvasható, 4 részleges és
7 sikertelen válasz. Ez gépi elérhetőségi eredmény, nem teljes szerkesztői áttekintés.

## Képeredet

- Biscay: https://www.christopherward.com/int/trident-biscay.html
- Rolex: https://www.rolex.com/watches/new-watches/oyster-perpetual-41
- Tudor: https://www.tudorwatch.com/en/watches/tudor-northflag/m9140g1a0u-0001
- Citizen dátumok: https://www.citizenwatch-global.com/news/2026/20260901/index.html
- Citizen nagyfelbontású képek: https://www.citizenwatch.com/ca/en/product/JY8144-50E.html
  és https://www.citizenwatch.com/ca/en/product/AV0104-06W.html

Csak a gyártók eredeti képállományait használtuk; nincs generált óra és nincs
generatív kivágás. A képkredit nem helyettesít felhasználási engedélyt.
