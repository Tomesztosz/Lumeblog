# SEO-fejlesztések: P2/P3 állapot és következő lépések

2026. október 18. A P2/P3 technikai megvalósítás elkészült a külön jóváhagyott
körben. Nincs kitalált keresési volumen, látogatottság vagy ígért helyezés.

## Jelenlegi állapot

Kész a stabil entitásrendszer, az indokolt kapcsolódócikk-ajánló, a cikk/modell/
naptár átjárás, a tíz modell két nyelvű olvasási útmutatója, a három gyűjtő
privát előnézete, a tartalmi leltár és az ellenőrzött helyi mérési import.
Részletek: [megvalósítás](SEO_IMPLEMENTATION.md), [tartalmi értékelés](SEO_CONTENT_REVIEW.md),
[mérési kézikönyv](SEO_MEASUREMENT.md).

## Amihez még döntés vagy adat kell

1. A gyűjtőoldalak szerkesztői felülvizsgálata és külön jóváhagyott publikálása.
   Addig nincs új indexelhető márka-/témaoldal.
2. Valós Search Console/Bing-export egy lezárt 28 napos alapállapothoz.
   A fióktulajdon, indexelési állapot, AI-részvétel és a sitemap-beküldés
   ellenőrzése a tulajdonosi felületen történik. Új követőkód nem szükséges
   az exportos induláshoz.
3. Első felülvizsgálat: 2026. november 15.; majd 2027. január 18. és április 18.
   Ezek nem automatikusan létrehozott ütemezések. Az időszakokat a valós
   export lefedettségéhez kell igazítani.
4. Saját modellből készült, szerkesztett állóképek vagy videók egyenkénti
   vizsgálata; a QA-képernyőkép nem válik automatikusan közösségi borítóvá.
5. A tartalmi értékelésben szereplő kutatási kérdések mérlegelése, valós
   keresési adat esetén annak bevonásával. Nincs automatikus átírás vagy
   azonos szándékra gyártott URL-sorozat.

Az IndexNow továbbra is opcionális, nem aktív. A sitemap/RSS működik;
külső indexelési jelzések és fiókműveletek nem készültek észrevétlenül.

## Korábbi terv, megőrzött kiindulópont

Az alábbi rész a P0/P1 kiadáskor készült terv. Az aktuális megvalósított
állapotot a fenti összefoglaló és a linkelt dokumentumok rögzítik.

## P2: ellenőrzött tartalmi kapcsolatok

A meglévő `translationKey`, cikkkapcsolatok, Műhely-modellazonosítók és
naptári identitások az alapok. Egy következő körben ezek mellé opcionális,
stabil márka-, modellcsalád-, referenciaszám-, szerkezet-, komplikáció- és
személyazonosítók kerülhetnek. A magyar és angol cikk ugyanazt az entitást
használja, de nem kell minden cikkhez minden mező.

Konkrét kiindulópontok a jelenlegi anyagokból:

- A Co-Axial, a horgonygátlómű és a Spring Drive a működési elv mentén
  kapcsolódhat. Nem az Omega márkanév összes előfordulása az elsődleges jel.
- Az oszlopkerék, El Primero és rattrapante a kronográf működése mentén
  egészítheti ki egymást, a különbségeket is megőrizve.
- Az ugró másodperc és a kvarc szabályozás összevethető, de nem azonos
  szerkezetként vagy entitásként kezelendő.
- Egy óráról szóló történet, a hozzá tartozó mechanikai modell és az azonos
  referenciájú naptárbejegyzés közé normál HTML-link kerülhet. A közös
  gyártónév nem elég egy konkrét modellkapcsolat igazolásához.

A kézi szerkesztői kapcsolat elsőbbséget kapjon. Csak magas bizonyosságú
találatból legyen automatikus publikus link; más esetben szerkesztői javaslat.
A belső súlyozás nem Google-rangsorolási modell. Ne legyen önhivatkozás,
nyelvkeveredés, duplikált ajánló vagy még nem publikált cikkre mutató link.

## Gyűjtőoldalak

Lehetséges első próbák: gátlóművek, kronográfok és független órakészítők.
Új indexelhető oldal csak ellenőrzött, egyedi bevezetővel és ténylegesen
hasznos cikk/modellegyüttessel készüljön. Nincs mesterséges cikkszámküszöb,
de puszta címkelista és kulcsszóváltozat nem indokol új oldalt.

## A Műhely és a naptár szerepe

A Műhely önálló, megosztható URL-jei és a szövegesen is hozzáférhető
magyarázatok már léteznek. Következő szerkesztői lépésként a modell saját
kérdését és konkrét megfigyelési pontját lehet pontosítani, modellenként,
nem ugyanazzal az általános szöveggel. Saját állóképes vagy videós előnézet
csak valódi modellből és ellenőrzött minőségben készüljön.

A naptár továbbra is hivatalos forrásokra és pontosan megkülönböztetett
bemutató/rendelés/kiszállítás eseményekre épül. A márkák szerkesztett cikkei
segíthetik a tájékozódást, de a lejárt kártyák miatt nem készülnek tömeges
SEO-aloldalak. Az állapotalgoritmushoz a SEO-réteg nem nyúlhat.

## P3: hozzáférés és mérési alapállapot

1. A tulajdonos ellenőrizze a `lumejournal.com` domain-tulajdont a Google
   Search Console és Bing Webmaster Tools fiókjaiban. DNS TXT-értéket vagy
   ellenőrzőkódot csak az adott szolgáltatás tényleges utasítása alapján szabad megadni.
2. A már működő `https://lumejournal.com/sitemap-index.xml` címet lehet
   beküldeni. Az URL-ellenőrzésben HU/EN cikk, modell, rovat és naptár is legyen.
3. A generatív Google-keresési részvétel aktuális Search Console-beállítását
   a tulajdonosi felületen is ellenőrizni kell. Ennek állapotát kódból nem igazoltuk.
4. Elsőként meglévő eszközből származó, legalább 28 napos összesített export
   kell. Az alapállapothoz URL, nyelv, oldaltípus, lekérdezés, megjelenés,
   kattintás, CTR és átlagos pozíció használható. Ne kerüljön a repóba
   személyes adat vagy hozzáférési token.
5. A webes keresés, Discover, kép/multimodális keresés és AI-felületek
   eredményeit külön kell értelmezni, nem mechanikusan összeadni.

A 2025-ös általános AI-features dokumentum mérési része önmagában már nem
elég a 2026-os helyzet leírására. Az újabb hivatalos közlések ellenőrizve:

- [Google generatív teljesítményjelentések, 2026. június 3., augusztus 31-i globális frissítéssel](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports): külön Search/Discover AI-láthatósági nézetek. A Lume saját adataihoz nincs hozzáférésünk.
- [Google multimodális jelentés, 2026. szeptember 24.](https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc): Lens és más kép-alapú lekérdezések szűrése/exportja, ha van ilyen forgalom.
- [Bing AI Performance, 2026. február 10.](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/): hivatkozási láthatóság, nem klasszikus rangsorhely.
- [Bing Topics Portfolio béta, 2026. október 13.](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/): irányadó, közelítő témacsoportok elegendő adat esetén. Kisebb oldalnál hiányozhat; a témaosztályozás tévedhet.

Nem állítjuk, hogy ezek mindegyike minden API-ból letölthető. Ahol csak a
felület vagy export érhető el, azt kell dokumentált bemenetként használni.

## Kiértékelés

Az első 28 nap után azonos nyelveket és oldaltípusokat hasonlítsunk össze,
majd három és hat hónapos időablakban is vizsgáljuk a trendet. Az új cikkek,
szezonalitás, indexelési késés, algoritmusfrissítés és kis minta hatását
külön kezeljük. A Search Console-adatok hiányából nem készül nullának
látszó statisztika vagy mesterséges lehetőségpontszám.

A P0/P1 technikai sikerfeltétele a hibamentes hozzáférhetőség és a
regressziómentes infrastruktúra. Ennek üzleti/olvasottsági hatása csak a
későbbi mérésekből derülhet ki. Új analitikai követőkód ebben a körben nem került be.
