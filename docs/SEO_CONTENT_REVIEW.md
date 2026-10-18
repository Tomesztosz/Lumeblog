# Tartalmi lefedettség és szerkesztői javaslatok

2026. október 18. Alap: a repó 30 cikkpárjának frontmattere, címei,
alcímei és a hozzárendelt entitásokhoz ellenőrzött szövegrészek.
Ez nem kulcsszóvolumen-kutatás vagy Search Console-elemzés.
A gépi leltár nem állítja, hogy minden alcím önmagában teljes választ ad.

Az újrafuttatható `npm run seo:editorial` az
`output/seo-p2-p3/content-inventory.json` fájlba írja a konkrét forrásfájlt,
ellenőrzési horgonyt, tényleges alcímeket, elsődleges entitásokat,
másodlagos témákat, publikus ajánlásokat és külön a bizonytalan javaslatokat.
Nem módosít kéziratot. Az új cikk entitásmező nélkül is megjelenhet;
hiányzó szerkesztői hozzárendelésből figyelmeztetés lesz, nem kötelező címkehalmaz.

## A meglévő anyagok szerepe

| Cikk kulcsa | Elsődleges olvasói kérdés / szándék | Hasznos másodlagos irány |
| --- | --- | --- |
| lorier-kezdes | Hogyan indult a Lorier, és mit kínál a kollekció? | Astra család, Miyota 9039, automata felhúzás |
| furlan-marri | Hogyan alakult a Furlan Marri formanyelve és kínálata? | Kronográf és független tervezés |
| kurono-tokyo | Mi a Kurono és a mester saját munkája közötti viszony? | Tervezői döntések és elérhetőség |
| christopher-ward | Mitől nőtt túl a Christopher Ward a microbrand keretein? | Ütőművek; a Bel Canto nem percütő |
| baltic | Hogyan vált az alapítói történet tartós kollekcióvá? | ST19, Miyota 9039, rotor |
| atelier-wen | Mit jelent a kínai eredet az Atelier Wennél? | Számlapkészítés és tervezés |
| brew | Hogyan lett a kávés időzítésből önálló óraterv? | Kronográf-kijelzés és meca-quartz döntés |
| seagull-1963 | Mi az 1963 és az ST19 kapcsolata? | Katonai eredet; oszlopkerekes kronográf |
| bravur | Hogyan kerül a kerékpársport az órák részleteibe? | Kronográf használata és tokarányok |
| otsuka-lotec | Hogyan jutott Katayama az esztergától saját kijelzésekig? | Retrográd kijelzés és No. 6 |
| vacheron-222 | Ki tervezte a 222-t, és miért számít ez? | Formatervezés, integrált sportóra |
| speedmaster | Hogyan lett versenyórából űrkutatási eszköz? | Kronográf mint feladathoz választott tárgy |
| santos-dumont | Milyen feladat hívta életre a Cartier korai karóráját? | Tervező és használó kapcsolata |
| frederique-constant-worldtimer | Mit kínál a Worldtimer a konkrét használatban? | FC-718 és világóra-kezelés |
| seiko-quartz-astron | Mit változtatott meg az Astron? | Kvarcszabályozás és másodperckijelzés |
| tag-heuer-monaco | Miért lett fontos egy kezdetben nehezen eladható óra? | Kronográf és szögletes tok |
| rolex-president | Honnan ered a Day-Date és a President elnevezés? | Márkalegenda és modellazonosság |
| todd-beamer-rolex | Mit lehet hitelesen elmondani Beamer órájáról? | Emléktárgy, bizonyíthatóság és típusazonosítás |
| omega-james-bond | Miben különböznek a filmes és jubileumi Bond Omegák? | Pontos referenciák, Seamaster család, Co-Axial |
| dirty-dozen | Hogyan teremtett közös arculatot a W.W.W. előírás? | Katonai követelmények és field órák |
| oszlopkerek | Hogyan kapcsolja össze az oszlopkerék a kronográf feladatait? | Vezérlés és tengelykapcsoló különbsége |
| spring-drive | Mi szabályoz gátlómű nélkül? | Energiaút, kvarcreferencia, siklókerék |
| gatlomu | Hogyan adagolja a horgonygátlómű az energiát? | Zárás, oldás és impulzus |
| vilagora | Hogyan olvasható le több város ideje? | GMT és nyári időszámítás korlátai |
| g-shock-technologia | Mitől védett a G-Shock modulja egy esésnél? | Lassulás és belső rögzítés |
| rotor-mukodese | Hogyan húzza fel a rotor a hajtórugót? | Energiaforrás és időszabályozás szétválasztása |
| percuto-mukodese | Hogyan olvassa le és üti el az időt a percütő? | Óra/negyed/perc; ütési sorrend |
| ugro-masodperc | Hogyan léphet másodpercenként egy mechanikus mutató? | Kijelzés, járatszabályozás és remontoir |
| rattrapante | Hogyan mérhető részidő a stopper megállítása nélkül? | Csipesz, visszazárkózás, kronográf-vezérlés |
| co-axial | Mit változtatott Daniels az energiaátadáson? | Közvetett/közvetlen impulzus, iparosítás |

## Átfedés vagy kiegészítés?

A kronográfos márkatörténetek és az oszlopkerék/rattrapante működési cikkei
nem ugyanazt a szándékot szolgálják. Nem vonjuk össze őket pusztán közös
szavak miatt. A Co-Axial és a horgonygátlómű összevethető, de külön elv.
A Spring Drive kvarcreferenciát használ, de nem azonos egy hagyományos
kvarcórával. Az ugró másodperc nem kvarcazonosító. A Bel Canto óránkénti
ütése nem jogosít fel a `minute-repeater` entitás hozzárendelésére.

A Rolex-történetek közös márkája önmagában nem elég automatikus ajánláshoz,
és különösen nem kapcsolja Beamer óráját az új Oyster Perpetual naptárkártyájához.
Az ilyen laza kapcsolat csak a helyi szerkesztői javaslatlistában marad.
Indokolatlan URL-szétbontást vagy igazolt összevonási kényszert nem találtunk
a címek és a fenti témaszerkezet alapján. Keresési kannibalizációt valós
lekérdezés/oldaladat nélkül nem állítunk.

## Következő kutatási kérdések, nem automatikus új cikkek

- Az automata felhúzás különböző irányváltó megoldásai. A rotor alapmodellje
  nem helyettesít minden gyári konstrukció részletes bemutatását.
- Kronográf-tengelykapcsolók összehasonlítása saját szemléltetéssel. Előbb
  nézzük meg, elég-e az oszlopkerék-cikk célzott kiegészítése; új URL nem alapértelmezés.
- Retrográd kijelzés működési modellje az Otsuka-cikk mellé. Jelenleg nincs
  ilyen Műhely-modell, ezért nem hoztunk létre nem létező modellre mutató linket.
- A világóra félórás/negyedórás zónáinak és nyári időszámításának konkrét
  gyártói megoldásai. A mostani alapmodell határait nem oldjuk fel állítással.
- Saját mérés vagy kézben kipróbált tapasztalat ott, ahol ténylegesen elérhető
  óra és dokumentált módszer van. SEO miatt nem nevezzük kéztesztnek a forrásfeldolgozást.

Ezek szerkesztői hipotézisek, nem keresési adatokkal bizonyított hiányok.
A meglévő próza, tényállítások, címsorok és képek nem változtak miattuk.

## Képek, modellek és gyűjtők

A P0/P1 képi ellenőrzése továbbra is vizsgálja a helyi elérhetőséget,
altot, méreteket, megosztási képet és nagy képelőnézeti engedélyt. Ez nem
új képjogi audit. A meglévő kredit és engedélyállapot nem lett átírva.
Termékképeket nem neveztünk át és nem generáltunk új óraképeket.

A modelloldalak saját, kezdeti HTML-ben olvasható kérdést, megfigyelési
szempontot és korlátot kaptak. A kapcsolódó animáció és megosztható URL
megmaradt. Valódi modellből készült állókép később használható saját képi
előnézetként. A mostani technikai QA képernyőképek nem szerkesztett borítók;
nem tettük őket automatikusan OG-képnek és nem állítottunk videót, ami nincs.

A három szerkesztett gyűjtőterv: járatszabályozás, kronográfok, független
órakészítés. Adatuk és komponensük kész, helyi fejlesztői előnézetük:

```text
/design/collections/magyar/regulation/
/design/collections/english/regulation/
/design/collections/magyar/chronographs/
/design/collections/magyar/independents/
```

`npm run dev` alatt nyithatók meg. Éles buildben nem generálódnak, és nincs
automatikus sitemap/címkeoldal-publikálás. Szerkesztői jóváhagyás után külön
kiadásban lehet végleges útvonalról, bevezetőről és navigációról dönteni.
