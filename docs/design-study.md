# Lume: teljes új megjelenés, elkülönített előnézet

**Friss állapot:** az elfogadott megjelenés már be van kötve a helyi normál
útvonalakra. A kiadási változat, a friss ellenőrzések és az elfogadott telefonos
próba leírása: [journal-release.md](journal-release.md). Az alábbiak az
előnézeti fejlesztés lépéseit és korábbi eredményeit is dokumentálják.

Külön, helyi, végigjárható előnézet. Nem módosítja az éles oldal elrendezését,
a cikkek szövegét, időzítését vagy a naptár tartalmát.

## Megnézés

Indítás: `npm run dev -- --host 127.0.0.1 --port 4332`.

Automatizált környezetben az Astro saját háttérindítása 30 másodperces
időtúllépést okozhat. Ilyenkor a szerverfolyamatnak adott
`ASTRO_DEV_BACKGROUND=1` mellett közvetlenül a
`node node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4332`
paranccsal indítható. Ez csak az adott folyamat beállítása, nem projekt- vagy
rendszerszintű módosítás. Az első indulás körülbelül egy percet is igényelhet.
A 2026. szeptember 12-i helyi ellenőrzésnél ez az indítás sikerült.

- Magyar nyitóoldal: http://localhost:4332/design/magyar/
- Magyar olvasófelület: http://localhost:4332/design/magyar/read/
- Angol nyitóoldal: http://localhost:4332/design/english/
- Angol olvasófelület: http://localhost:4332/design/english/read/
- Archívum: http://localhost:4332/design/magyar/cikkek/
- Rovatok: a fejléc Kézben, Eredet és Szerkezet linkjein.
- Naptár: http://localhost:4332/design/magyar/naptar/
- Műhely: http://localhost:4332/design/magyar/muhely/
- A naplóról: http://localhost:4332/design/magyar/rolam/
- 404: http://localhost:4332/design/magyar/404/

Minden megjelent cikk külön előnézeti URL-t kapott, mindkét nyelven. A nyelvváltó
a megfelelő párra vezet. A `/read/` továbbra is a Brew olvasófelületének rövid címe.

A dinamikus előnézeti útvonal csak fejlesztői módban ad vissza oldalakat.
Éles buildben üres az előnézeti útvonallista. Az elfogadott közös komponensek
viszont most már a normál oldalak csomagolásának is részei.
A próbaoldalakon külön `noindex,nofollow` is szerepel.
Nincs feltöltve, nincs nyilvános preview, és nincs bekötve az éles navigációba.

## Vizuális irány

Kortárs, szerkesztett órás folyóirat. Nagy, szoros betűközű LUME-fejléc,
meleg törtfehér felület, hangsúlyos eredeti termékfotók, eltérő szélességű és
magasságú ajánlók. Külön sötét szerkezeti blokk tagolja a nyitóoldalt.
A sárgaréz és lume-jelzés megőrzi a kapcsolatot az eredeti arculattal.

A mostani cikkekből dolgozik: a teljes cikkállomány tényleges magyar és angol szövegét
rendereli, nem külön másolatot. Az illusztrációk már meglévő fotók és korábban
jóváhagyott kivágások. Új képet nem generáltunk, fájlokat nem retusáltunk.
A nyitóoldal négy kiemelt története eredeti fotót vagy korábban elfogadott kivágást
használ. A közös cikk- és ajánlófelület 19 történetnél a már meglévő, forrásolt
fotókból és részletképekből választ, a két nyelv saját képaláírásával.
Ezt a `src/lib/design-media.ts` előnézeti képjegyzéke kezeli. A képaláírás teljes
tartalma, a forráslinkek és a korábbi módosítások jelzése megmarad. Hiányzó
fordított kreditnél hibát jelez, nem talál ki forrást.

A Lorier alapítói összeállítása és a gátlómű korábbi nyitóábrája egyelőre megmaradt:
ezekhez ebben a körben nem készült új, megfelelően forrásolt helyettesítő kép.
Az oszlopkerék a meglévő, szerkesztőségi jelöléssel ellátott El Primero-fotót
használja, nem újonnan rajzolt szerkezetet. Új fotóbeszerzés és retusálás nem történt.

### Egységes képkezelés az egész előnézetben

A cikkek, kapcsolódó ajánlók, rovatok, archívum, naptár és műhely nyitóképei
nem kapnak kötelező 4:3-as, szürke képdobozt. A képméretet a forrás aránya
határozza meg. A magas képek szélessége a magassági korláttal együtt csökken,
így maga a képelem sem tartalmaz hozzáadott üres sávot. A kivágott termékek
mögött az oldal saját háttere látszik, a nyitóoldali ajánlókban is.

Kivétel az ellenőrzött Brew csuklófotó: az ajánlóban négyzetes, a cikk élén
4:3-as, 50% 40% fókuszú részlet. A nagyító a teljes eredeti kompozíciót nyitja.
A meglévő feliratos herók, archív fotók és műszaki ábrák nem kapnak automatikus
vágást. A törzsképek megtartják természetes arányukat.

A közös cikknyitókép 320 és 2200 pixel közötti, legfeljebb az eredeti
felbontású méretváltozatokat kínál. A képnéző a rendelkezésre álló nagyobb
változatból is választhat, nem ragad a mobilon betöltött kis képnél.
A fájlok felbontását mesterségesen nem növeltük, új részleteket nem generáltunk.
Az eredeti fotóba beépült háttér és a sablon által hozzáadott sáv külön dolog:
ebben a körben az utóbbit szüntettük meg, az elfogadott fotókat nem retusáltuk.
A modellek működése változatlan. A belső megjelenés előnézeti stílusréteget kapott;
a tulajdonos a látott megjelenést elfogadta. A teljes böngészős használati
ellenőrzés ettől külön lépés, lásd alább.

### Olvasófelület és modellkeret

A cím kiegyensúlyozott tördelést, a bevezető hangsúlyosabb méretet kap.
A mobilos fejezetjegyzék összecsukva indul, kinyitva egyoszlopos és nagyobb
érintési felületű. JavaScript nélkül a teljes tartalomjegyzék látszik.
A forráslista külön nyitható, megmutatja a hivatkozások számát.

A `DesignArticleBody.astro` a megbízható helyi Markdown renderelt HTML-jét
dolgozza fel. Csak a cikk metaadataiban megadott, helyi `/widgets/*.html`
iframe-et cseréli a közös modellkeretre, még a szerveren. A beágyazás így
nem töltődik le a gomb megnyomása előtt.

A már megjelent saját cikkekre mutató törzshivatkozásokat szintén szerveroldalon
az előnézeti párjukra képezi le (`src/lib/design-links.mjs`). A lekérdezési
paraméter és a fejezethorgony megmarad, a külső források, képkreditek és
ismeretlen útvonalak változatlanok. Ehhez már nem kell JavaScript, és a teljes
cikk-URL-jegyzék sem kerül minden oldal HTML-jébe. Cikkszöveg, frontmatter és
publikálási dátum nem változik.

A `DesignModel.astro` a Műhelyben és a cikkekben ugyanazt az indítást,
bezárást, nyelvkezelést és fényhidat használja. A cikken belül rövid cím és
magyarázat helyettesíti a megismételt nagyméretű posztert. A bezáró sáv a
modell görgetése közben elérhető marad. Bezáráskor az iframe megszűnik,
a fókusz visszatér az indítógombra. Külön oldalas megnyitás és JavaScript
nélküli hivatkozás is elérhető. A modellek fizikai logikája és szkriptjei
nem változtak. A normál bekötéskor az eredeti HTML-fájlok egy stíluslinket
és egy body-jelölőt kaptak; ugyanaz az elfogadott stílusréteg illeszkedik
az előnézeti és a normál olvasófelülethez.

### Modellbelsők: elfogadott megjelenés, hátralévő használati ellenőrzés

A hét modell előnézeti URL-je: `/design/models/<modell>.html`, az angol változat
ugyanez `?lang=en` paraméterrel. A cikkek és a Műhely már ezeket hívják, az önálló
megnyitás is ide vezet. A fejlesztői útvonal az eredeti `public/widgets/` fájlból
dolgozik, megtartja annak szövegét, SVG-geometriáját és szkriptjeit, és csak
`noindex` jelölést, valamint kiegészítő CSS-t illeszt be. Éles buildben nincs
egyetlen ilyen útvonal sem; az eredeti modellcímek változatlanok.

Közös paletta: `src/styles/lume-palette.css`. Kiegészítő modellstílus:
`src/styles/design-model.css`. Egységes cím- és bevezetőméret, szögletes
kezelőszervek legalább 44 pixeles magassággal, olvasható állapotjelzések és
világos/sötét felületek. A régi modellek mindkét helyi fontcsalád-elnevezése
támogatott. A világóra nappal/éjszaka jelölése és a mechanikák saját színjelzései
megmaradnak. A függőleges térköz a mért kártya része, hogy a meglévő
magasságjelentés ne vágja le az iframe alját.

A `src/lib/design-frames.ts` csak azonos eredetű, az engedélyezett hét előnézeti
útvonalon betöltött, tényleges küldőablaktól fogad üzenetet. Megőrzi az eredeti
`lume:lights`, `lume:ready` és `lume:height` protokollt és a 6000 pixeles korlátot.
A publikus `frame-bridge.js` változatlan; a modellek továbbra is annak
eredetellenőrzött `bindChild` függvényét használják.

Az első, még elkülönített modellkör ellenőrzése:

- `node --test scripts/design-models.test.mjs`: 9 sikeres teszt, köztük a hét
  eredeti modell tartalmának, gombjainak, szkriptjeinek és SVG-jének megőrzése,
  valamint a tiltott útvonalak, idegen üzenetküldők és hibás magasságok elutasítása.
- Teljes `npm run build`, SEO-, biztonsági és naptártesztek sikeresek.
- A 90 publikus HTML-, XML- és ICS-fájl ellenőrzőösszege változatlan;
  nincs `dist/design`, és a `public/widgets/` fájljai sem módosultak.
- Szeptember 12-én az új modellútvonalak HTTP-kiszolgálása mindkét nyelvi
  URL-lel sikeres; a tulajdonos a látott megjelenést elfogadta.
- **Még nincs új automatikus böngészős eredmény:** mobilos elrendezés,
  kattintás, magasság és axe az új modellbelsőkön. A böngészőindítást a
  futtatókörnyezet tiltotta. A korábbi böngészős teszteredmények nem igazolják
  ezt az új stílusréteget; a HTTP-ellenőrzés nem futtatja a modell JavaScriptjét.

Az élesítés előtt a hét modellt magyarul és angolul, 320/390/1440 pixelen,
mindkét témában is végig kell próbálni: indítás, bezárás, magasság és önálló
megnyitás. A vizuális jóváhagyás nem helyettesíti ezt a használati ellenőrzést.

## Kipróbálható funkciók

- Kereső valódi megjelent cikkekkel, billentyűzetes bezárással.
- Világos és sötét mód, elkülönített munkamenet-tárolással. Nem írja át az
  éles oldal fénybeállítását.
- Sötétben a LUME felirat, az óra indexei és mutatói hangsúlyos lume-fényt
  kapnak. A cikkek törzsszövege és a fotók nem derengenek.
- Élő analóg óra a fejléc jobb oldalán, az olvasó készülékének helyi idejével.
  Önálló arculati elem: nagyobb, LUME márkajelzésű számlap, kettős sárgaréz
  tokgyűrű, percosztás és alapítási év. Mobilon a logóval közös fejlécpárt alkot.
  A számlap képernyőolvasós neve percenként frissül, élő bejelentés nélkül.
  Képernyőn kívül és háttérbe tett lapon a frissítés szünetel.
- Finom fényátmenet a lámpakapcsoláskor, folyamatos pulzálás nélkül.
  Csökkentett mozgás mellett nincs átmenet, a másodpercmutató lépve jár.
- A nyitófotók és a cikkek törzsképeinek nagy nézete, a képkredit megőrzésével,
  natív dialoggal, Escape és bezáró gombbal. A törzsképek billentyűzettel is megnyithatók.
- Minden cikk: fejezetnavigáció, haladásjelző, megjegyzett betűméret, források,
  kapcsolódó írások, hivatkozásmásolás és rovatra visszavezető út.
- Archívum: ékezetfüggetlen keresés, rovatszűrők és sorrend. A szűrés URL-ben is
  megmarad. Üres találati állapot és alaphelyzetbe állítás.
- Mindhárom rovat saját bevezetővel, nagy első ajánlóval és továbblépési irányokkal.
- Naptár: a meglévő adatok, szűrés, dátumkezelés, ellenőrzési dátumok és ICS-ek.
  Nincs új bejelentés felvéve, a `lastReviewed` nem változott.
- Műhely: az eredeti modellek csak indításkor töltődnek be, bezáráskor megszűnnek.
  Az előnézeti szülőhíd és a modellek eredeti `frame-bridge.js` kódja
  eredetellenőrzéssel szinkronizálja a fényt és a magasságot.
- A naplóról oldal heti rovatbeosztással és RSS-hivatkozással.
- Saját 404 keresővel és rovatválasztással, valódi HTTP 404 válasszal az előnézeti
  404 útvonalon. A publikus és az ismeretlen útvonalak jelenlegi hibakezelése változatlan.
- Képhiba esetén olvasható helyettesítő állapot, újrapróbálás és megmaradó képkredit.

Nem része ennek a körnek a fogalomtár, új fotók vagy fotóra helyezett műszaki
magyarázatok készítése. A nyitóoldali válogatás továbbra is tudatosan a jóváhagyott
Brew, Atelier Wen, Rolex és rotor összeállítás, nem automatikusan a legfrissebb négy cikk.

## Elkülönítés és ellenőrzés

Oldalválasztó: `src/components/design/LumeNext.astro`.
Közös keret: `DesignShell.astro`; külön Home, Article, Library, Calendar,
Workshop, About és NotFound komponens. Közös Media, Card és Model komponensek.
Saját stílus: `src/styles/lume-next.css` és `src/styles/lume-pages.css`.
Saját működés: `src/lib/lume-next.ts`; útvonalképzés: `src/lib/design.ts`.
Kétnyelvű szövegek: `DESIGN_STUDY` az `src/i18n/ui.ts` fájlban.

A normál oldalak bekötése óta a komponenseket már a publikus útvonalak is
használják; eltávolítás előtt a sablonválasztást is vissza kell állítani.
A normál `npm run build` SEO- és biztonsági ellenőrzéseinek továbbra is át
kell menniük. A `dist/design` útvonalnak nem szabad léteznie.

Böngészős próba: magyar és angol oldal, 320/390/1440 pixel szélesség,
képek dekódolása, keresés, képnéző, Escape, fénybeállítás oldalváltás után,
betűméret, vízszintes túlcsordulás és futási hibák.

Az automatikus akadálymentességi próba axe-core segítségével, világos és sötét
nézetben ellenőrzi a hét fő oldaltípust. Ez nem helyettesít valódi VoiceOver,
TalkBack, Safari és különböző telefonokon végzett kézi ellenőrzést.

Ellenőrzés 2026. szeptember 11-én:

- 62 előnézeti útvonal: státuszkód, egyetlen főcím, noindex, iframe-címkék.
- Mind a nyolc oldaltípus 320, 390 és 1440 pixel szélességen; angol párjaik mobilon.
- Mind a 42 cikk 320 és 1440 pixelen: túlcsordulás, képek dekódolása, nyelvpárok.
- Keresés, szűrés, rendezés, üres állapot, szűrés újratöltés után; naptárkeresés.
- Képnagyítás és képkredit, billentyűzetes nyitás, Escape és fókusz visszaadása.
- Képhiba és újrapróbálás, megjegyzett betűméret és téma, modellindítás/bezárás,
  sötét mód szinkronizálása a modellel.
- Axe-core: a vizsgált WCAG 2 A/AA, 2.1 AA és 2.2 AA automatikus szabályok
  nem jeleztek hibát a hét vizsgált oldaltípuson, világos és sötét módban.
- Óra: aktuális idő, képernyőn kívüli szünet, csökkentett mozgás élő váltása.
- Teljes `npm run build`, SEO-, biztonsági és naptártesztek sikeresek.
- A publikus build mind a 90 HTML-, XML- és ICS-fájljának SHA-256 értéke
  megegyezik a teljes előnézeti átépítés előtti builddel. Nincs `dist/design`.

A képkezelés frissítése után a 42 cikkes és a 62 útvonalas próba újra sikeres.
A fő oldaltípusok képarány-ellenőrzése a cikkajánlókat, a naptár képeit és a
műhely nyitóképeit is méri, nem csak a betöltést. Az összes archívumkártyáról
készült képernyőkép, külön mobilos törzskép-, nagyító- és sötét módos próba is.
A nagyítóhoz a törzsképek meglévő `srcset` méretsora is átkerül.
Az új build 90 publikus fájlja ezután is bájtról bájtra változatlan.

Az olvasófelület következő körében ismét sikeres a 42 cikkes és 62 útvonalas
próba. Külön ellenőrzés készült mind a 14 magyar és angol cikkbe ágyazott
modellre: kattintás előtti nulla iframe, indítás, betöltés, témaváltás,
bezárás, fókusz-visszaadás, egyedi azonosítók, fejezetjegyzék és forráslista.
A régi HTML-blokkok után szövegként maradt Markdown-csillagok helyett a
modellmagyarázatok szemantikus képaláírást kapnak; a sima magyarázó bekezdések
változatlanok. Az olvasási haladás a modell magasságának és a betűméretnek
változását is követi.

A hét alapoldal világos és sötét axe-próbája, valamint a percütős cikk
indítás előtti és elindított modellkeretének világos és sötét ellenőrzése
nem jelzett automatikusan kimutatható WCAG-hibát. Valódi iPhone/Android és
képernyőolvasós kézi ellenőrzés még szükséges az élesítés előtt.

## Átállási ellenőrző alap, 2026. szeptember 12.

A `scripts/check-design-release.mjs` helyi ellenőrző eszköz. Nem publikál,
nem módosít kapcsolót, időzítést vagy naptári ellenőrzési dátumot, és nincs
automatikusan bekötve a buildbe. A jelenlegi publikus buildből mentett alap
segítségével ellenőrizhető, mit őrzött meg egy későbbi sabloncsere:

- Minden HTML-, XML- és ICS-útvonal, az önálló modellekkel együtt.
- Oldalnyelv, cím, leírás, canonical, hreflang, kereső- és megosztási metaadatok,
  teljes JSON-LD, cikkdátumok és RSS-felfedező linkek.
- Az RSS-, sitemap- és ICS-fájlok, a robots.txt és a HTTP-biztonsági fejlécek
  ellenőrzőösszege. A HTML elrendezése és CSS-e változhat; az oldalankénti CSP-t
  továbbra is a normál biztonsági build ellenőrzi.
- Az elkülönített `/design/` útvonal nem szivároghat a publikus buildbe.

Kiindulási alap mentése egyszer, még a publikus sablonok bekötése előtt:

```sh
npm run build
node scripts/check-design-release.mjs --snapshot .codex-work/design-release-before.json
```

Ez a helyi alap már elkészült; a parancs meglévő fájlt szándékosan nem ír felül.
Eltérést előbb meg kell vizsgálni, nem szabad új alap mentésével automatikusan
elfogadni. Ha közben szándékos tartalmi kiadás történik, külön kell eldönteni,
melyik friss publikus build lesz az átállás összehasonlítási alapja.

Új build után, futó helyi fejlesztői szerverrel:

```sh
node --test scripts/design-release.test.mjs scripts/design-models.test.mjs
node scripts/check-design-release.mjs --against .codex-work/design-release-before.json --preview http://127.0.0.1:4332
```

Az előnézeti HTTP-próba ellenőrzi a státuszkódokat, nyelveket, noindexet,
főcímeket, fordítási linkeket, egyedi azonosítókat, belső linkeket és horgonyokat,
a kattintás előtti iframe-mentességet, valamint a hét modell mindkét nyelvi
indítólinkjét és kiszolgálását. Csak helyi HTTP-címet fogad el, átirányítást
nem követ. Ez HTML-ellenőrzés, nem kattintásos vagy akadálymentességi próba.

Eredmény: 25 célzott teszt sikeres; 62 előnézeti oldal, 42 cikknyelvi változat,
14 modellnyelvi URL és 3476 belső hivatkozás hibamentes. Az összehasonlítás
59 publikus oldal SEO-adatait, 90 útvonalat és 26 védett fájlt fed le: az új
build után mind változatlan. A teljes `npm run build`, benne a SEO-, naptár-
és biztonsági ellenőrzés is sikeres.

## Átállási lépések állapota

1. A megjelenés és a tulajdonos saját telefonos áttekintése elfogadott.
   A több készülékre és minden funkcióra kiterjedő lefedettség nincs igazolva;
   a friss állapotot a `journal-release.md` részletezi.
2. **Helyben elkészült:** a publikus útvonalak változtatása nélkül az új komponensek bekötése.
   A meglévő canonical, hreflang, strukturált adatok, RSS, sitemap és CSP
   megőrzése, az előnézeti `noindex` leválasztása a publikus keretről.
3. **Helyben elkészült:** a publikus 404 lecserélése és ismeretlen HU/EN URL-lel való ellenőrzése.
4. Teljes build, SEO-, biztonsági és naptártesztek sikeresek. Az élesítés külön jóváhagyást igényel.
5. Visszaállítható kiadás: a jelenlegi sablonok az elfogadásig megmaradnak.

Nincs commit, push, deploy vagy időzítőmódosítás az előnézet elkészítésének részeként.
