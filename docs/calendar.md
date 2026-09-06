# Megjelenési naptár és újdonságfigyelő

## Mi változott 2026. szeptember 6-án?

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

Az alapnézet megtartja az elmúlt 60 nap naptári eseményeit is. A bemutatott,
dátum nélküli kártyák nem kapnak hamis „ma megjelent” címkét. A márkaválasztó
mind a 24 figyelt márkát tartalmazza, üres találatnál sem állítja, hogy nincs újdonság.
A kliens és a szerver közös, Budapest-időzónás dátumlogikát használ.

## Napi felderítés és szerkesztői munka

`npm run radar:check` végigkéri a radar elsődleges és további hivatalos forrásait.
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
