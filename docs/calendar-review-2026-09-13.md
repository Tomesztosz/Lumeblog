# Naptárellenőrzés: 2026. szeptember 13.

Az ugró másodpercről szóló pénteki cikkpár időzítéséhez kapcsolódó áttekintés. A legutóbbi teljes ellenőrzési nap 2026-09-06, a közvetlen előzmény a [szeptember 12-i részleges audit](calendar-review-2026-09-12.md). Mind a 24 márka 44 regisztrált URL-jén ellenőrzési kísérlet történt, az `additionalSources` címeket is beleértve. A hozzáférhető híreket és a meglévő kártyák részletes forrásait összevetettük. A hozzáférési korlátokat nem értelmezzük úgy, hogy nincs új hír.

## Gépi ellenőrzés és feldolgozási sor

- `npm run radar:check`, 2026-09-13T18:31:26Z: 33 olvasható, 4 részleges, 7 sikertelen URL. A gépi olvashatóság nem teljes szerkesztői lefedettség.
- `.calendar-radar/report.json`: 929 függő helyi jelölt. A megváltozott hash-ek mögött az Omega indexe, a Seiko HDB010 és a RÁTH DROMA oldala áll; a hash-változás nem új bejelentési dátum.
- A [GitHub #10 forrásfigyelő listát](https://github.com/Tomesztosz/Lumeblog/issues/10) elolvastuk. A 06:16:25Z-s futás 957 függő jelöltet tartalmazott. A két cache eltérését nem számoljuk feldolgozott hírnek. Nem töröltünk és nem zártunk le tömegesen jelölteket.

## Márkánkénti eredmény

A regisztrált pontos URL-ek a `src/data/brand-radar.json` fájlban maradnak; a sorok a fő- és kiegészítő források együttes eredményét rögzítik.

| Márka | Ellenőrzés és korlát |
| --- | --- |
| Rolex | Gépi 403 után webesen megnyitható a 2026-os újdonságlista és az OP41-adatlap. A felvett OP41 adatai egyeznek; nincs új, közös értékesítési nap. |
| Omega | Az index olvasható része továbbra is a korábban feldolgozott Speedmaster 38 közleményt emeli ki. A részletes sajtóarchívum hozzáférése korlátozott, nem teljes katalógusellenőrzés. |
| Cartier | Webes 403. A gépi letöltés olvasható, változatlan tartalmat jelzett, de ez nem tekinthető mostani teljes emberi kínálatellenőrzésnek. |
| Tudor | Az index és a Northflag adatlap webesen olvasható. A 40 mm-es GMT, MT5652-U és butik-kizárólagosság megfelel a meglévő kártyának; új jövőbeli dátum nincs a látott tartalomban. |
| TAG Heuer | A regisztrált index gépi 403 és webes hiba miatt nem ellenőrizhető teljesen. A korábbi Carrera Sport jelölt feldolgozása nyitva marad. |
| Breitling | Az index NFL-kiadásokat emel ki. A részletes modell- és dátumellenőrzés a korábbi sorban marad. |
| Longines | A hírlista dinamikus váza nem ad teljes hírtartalmat a webes pótkísérletben sem. Hiányos lefedettség. |
| IWC | A regisztrált katalógus időtúllépés/webes hiba után is hiányos. A [hivatalos sajtóarchívum](https://press.iwc.com/?h=1) legfrissebb látható közleménye augusztus 27-i. |
| Zenith | Az index böngészős lekérése hibás. A Paris Edition külön közleménye olvasható: szeptemberi párizsi butikérkezés, a francia online indulás már júniusban megtörtént. |
| Seiko | A dinamikus index helyett a regisztrált saját JSON-feed legfrissebb tételeit elolvastuk: szeptember 9-i VANAC-oldalfrissítés, szeptember 4-i Laurel/Presage cikk. A Presage szeptemberi dátuma megerősítve. A HBC011 amerikai URL-je helyett az [azonos hivatalos globális közlemény](https://www.seikowatches.com/global-en/news/2026/pr/20260826) igazolja az októbert. A HDB010 jelenlegi termékoldala nem adja vissza a régi szeptemberi dátumot, ezért ellenőrzési bélyege változatlan. |
| Grand Seiko | A regisztrált JSON-feed olvasható, a webes index hiányos. Az ausztrál Evolution 9 közlemény megerősíti az öt Spring Drive modell szeptemberi bevezetését; a Hi-Beat később, októberben érkezik, nem része ennek a kártyának. |
| Citizen | Fő hírlista, két kanadai termékoldal és két közlemény ellenőrzési kísérlete megtörtént. A részletes globális közleményekben az ATTESA októberi, a SKYHAWK és TSUNO szeptemberi dátuma változatlan. A kanadai oldalak önmagukban nem jelentik minden piac készletellenőrzését. |
| Casio / G-Shock | Kategóriaindex olvasható, nem teljes dátumozott újtermék-feed. Nem állítunk minden újdonságra lefedettséget. |
| Jaeger-LeCoultre | A regisztrált oldal 503, a sajtóoldal újranyitása is hibás. Hivatalos keresőtalálatban a korábban ellenőrzött szeptember 9-i három újdonság szerepel. A részletes képes feldolgozás továbbra is nyitott. |
| Baltic | A kollekcióindexben az Aquascaphe GMT MK-II is szerepel. A korábbi jelöltet nem tekintjük új, dátumozott megjelenésnek. |
| Christopher Ward | Főoldal, búváróra-lista és sajtóoldal áttekintve. Biscay és Sealander szerepel; a külső sajtóképtár nincs teljesen feldolgozva. |
| Kurono Tokyo | A Malachite rendelési ablaka lezártként szerepel; a látható tartalomban nincs új nyitási időpont. |
| Furlan Marri | Az aktuális modelllista olvasható. Nem rendel a látott kollekcióhoz közös jövőbeli dátumot. |
| Lorier | A kollekció és az Astra adatlap olvasható. A szeptemberi korábbi előrendelések kiszállítása zajlik, a termék jelenleg nem rendelhető. A kártya két nyelvi elérhetőségi szövegét javítottuk. |
| RÁTH | Főoldal és DROMA adatlap: továbbra is szeptember végi szállítás, 50 darabos Founder Series. A változó oldalhash nem jelent új dátumot. |
| MING | Főoldal, journal és Lightning oldal megnyitva. A Lightning oldalon eltérő állapotüzenetek maradtak: lezárt szállítás/kifogyás, illetve szünetelő rendelés és 2026 júniusától 2027 végéig tartó szállítás. Ebből nem állapítunk meg új, pontos elérhetőséget. |
| Farer | Katalógus áttekintve. Az év nélküli november, a 2027-es tavasz és az év végi jelzésekből nem készítünk pontosabb dátumot. A korábban vizsgált Thorne Gold készlet-visszatérés nem új modellbevezetés. |
| Studio Underd0g | Főoldal és Mantis oldal: a szeptember 1-jei rendelési ablak már elmúlt, új nyitási időpont nincs a látott szakaszban. |
| NOMOS | Az újdonságlista Handelsblatt-, arany-, Ahoi-, Tangente- és Club-sorai láthatók. Nem rendel hozzájuk közös jövőbeli megjelenési dátumot. |

## Átvezetett módosítások és nyitott tételek

A [Lorier Astra hivatalos adatlapja](https://www.lorierwatches.com/products/watch-astra-white-nodate-bracelet-278081) alapján az elérhetőség magyarul és angolul pontosítva: a korábbi előrendelések szállítása zajlik, új rendelés most nincs. A szeptemberi időablak és a két ICS nem változik.

A külön elolvasott, egyező forrású meglévő bejegyzések `sourceChecked` mezője szeptember 13-ra frissült. Kivétel a HDB010: a korábbi dátuma most nem erősíthető meg. A Christopher Ward bejegyzés saját részletes forrásának bélyegét sem frissítjük csupán a kínálati index alapján.

Ebben a körben nincs új kártya vagy új ICS. Ez nem azt jelenti, hogy nem létezik további újdonság. A korábbi [JLC, King Seiko, Breitling és TAG feldolgozási lista](calendar-review-2026-09-12.md#nyitott-részletes-feldolgozás) nyitva marad. A már bemutatott, jövőbeli dátum nélküli modelleknek helyi kép és teljes forrásellenőrzés után az `announcements.json` a helye, nem egy kitalált dátumos eseménynek.

## Lefedettség és technikai ellenőrzés

A `calendar-meta.json` `lastReviewed` mezője **változatlanul 2026-09-06**. Nem állítunk teljes radarlefedettséget. Ez dokumentált részleges ellenőrzés, nem a gépi letöltés átnevezése teljes emberi auditnak.

A cikkcsomag végső `npm run build` ellenőrzése sikeres: a magyar és angol naptár, a 11 dátumozott és 3 dátum nélküli kártya, valamint a 22 ICS hibamentes. Új ICS nem készült; a meglévő két Lorier-fájl pontosított elérhetőségi szöveggel újraépült. Az eredmény a cikk forrásjegyzetében is szerepel.
