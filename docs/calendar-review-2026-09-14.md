# Naptárellenőrzés a szerdai Beamer-cikk időzítéséhez

Dátum: 2026. szeptember 14. Az előző teljesként nyilvántartott áttekintés:
2026. szeptember 6. A szeptember 13-i részleges ellenőrzés nem írta ezt felül.

## Lefedettség és korlát

A `src/data/brand-radar.json` mind a 24 márkájának 44 URL-jét, az
`additionalSources` címeket is beleértve, megnyitottuk a gépi figyelővel és
külön Chrome böngészővel. A gépi futás kezdete `2026-09-14T17:33:28.513Z`:
33 olvasható, 4 részleges és 7 sikertelen forrás. Ez önmagában nem emberi
áttekintés. A renderelt oldalak címei, hírei és dátumos részei külön átnézésre
kerültek; a hiányos oldalakhoz webes olvasóval is történt ellenőrzési kísérlet.

Nem sikerült teljes tartalmi lefedettséget elérni:

- Cartier: a böngésző és a webes olvasó a regisztrált kollekcióoldalhoz hozzáférést tiltott.
- TAG Heuer: a regisztrált újdonságoldal böngészőben tiltott; a webes olvasó sem adott érdemi tartalmat.
- IWC: a böngésző csak a régióválasztó üzenetet mutatta, a gépi és webes próbák nem adtak teljes kollekciót.
- Longines: a hírlista kategóriái betöltődtek, az érdemi hírek nem. Ebből nem következik, hogy nincs új hír.

A Rolex és Tudor tiltott böngészős válaszai után a webes olvasóban elérhető
hivatalos újdonság- és termékoldalak tartalmát is ellenőriztük. A MING nyitóoldal
böngészős üres válaszát webes olvasóval pótoltuk; a journal és a Lightning
termékoldal böngészőben is olvasható volt. A Seiko és Grand Seiko dinamikus
hírlistája a böngészőben látható hírekkel és a nyilvános JSON-forrással is szerepelt.

A `calendar-meta.json` `lastReviewed` mezője ezért **2026-09-06 marad**.
Nem állítjuk sem a teljes radar, sem a korábbi összes függő termékjelölt
feldolgozását. A kimaradt oldalak későbbi ellenőrzése továbbra is szükséges.

## Szerkesztői áttekintés

| Márka / forráscsoport | A most olvasható tartalom és eredmény |
| --- | --- |
| Rolex, 2 URL | A 2026-os kínálat és az Oyster Perpetual 41 továbbra is elérhető. A meglévő announcement nem kap kitalált értékesítési napot. |
| Omega | Szeptember 7-i partnerségi és 8-i nagyköveti hírek; a Speedmaster 38 főkiemelés is látható. A hírek dátuma nem automatikusan termékmegjelenés. |
| Cartier | Hiányos hozzáférés, nyitva marad. |
| Tudor, 2 URL | Az új Northflag és a 2026-os kollekció olvasható; a butik-exkluzivitás megerősítve, új naptári nap nincs megadva. |
| TAG Heuer | Hiányos hozzáférés, nyitva marad. |
| Breitling | NFL csapatkiadások jelentek meg a kiemelésben. A külön kollekcióoldalt is átnéztük; most nem része a szűk szerkesztői válogatásnak. |
| Longines | A hírlista nem tölti be az érdemi tételeket; nyitva marad. |
| IWC | Régióválasztó mögötti tartalom nem ellenőrizhető teljesen; nyitva marad. |
| Zenith, 2 URL | A legfrissebb látható sajtótétel szeptember 2-i. A Paris Edition szeptemberi párizsi butikérkezése változatlan. |
| Seiko, 5 URL | Szeptember 9-i VANAC-különoldal-frissítés, az új HKF005 variáns külön ellenőrizve. A Presage szeptemberi és a HBC011 októberi dátuma változatlan. A MOTOCOMPO-oldal új HDB005 ajánlása külön ellenőrizve. |
| Grand Seiko, 3 URL | A látható hírlista július 31-ig tart. Az Evolution 9 Spring Drive család szeptemberi, a mechanikus család októberi; ez két külön időpont, nem írható össze. A meglévő U.F.A. kártya nem módosult. |
| Citizen, 5 URL | Az ATTESA szeptember 9-i közleménye októberi tervezett indulást ad meg; már szerepel. A SKYHAWK és TSUNO CHRONO szeptemberi dátuma változatlan, a kanadai termékoldalak is ellenőrizve. |
| G-Shock | A regisztrált oldal kollekcióválasztó. Nem bizonyítja az összes egyedi modell vagy helyi bemutató ellenőrzését. |
| Jaeger-LeCoultre | A böngészőben olvasható hírlistán a legfrissebb tétel július 28-i. |
| Baltic | Az Aquascaphe GMT MK-II kiemelés és a 12 kollekció látható; a listán nincs új, külön igazolt megjelenési nap. |
| Christopher Ward, 3 URL | Biscay, Sealander és búváróra-katalógus. A sajtóoldal kapcsolati és erőforrásoldal, nem új termékdátum. A Biscay meglévő családkártyája megmarad. |
| Kurono | A Malachite rendelési ablaka lezárva szerepel. |
| Furlan Marri | A jelenlegi kollekciók és termékek láthatók; a listán nincs egységes jövőbeli indulási dátum. |
| Lorier, 2 URL | Az Astra korábbi előrendeléseinek szeptemberi kiszállítása és a zárt új rendelés továbbra is szerepel. |
| RÁTH, 2 URL | A DROMA GMT továbbra is szeptember végi előrendelésként jelenik meg, 50 darabos Founder Series. |
| MING, 3 URL | Lightning és a journal ellenőrizve. A Lightning szállítása 2026. júniustól 2027 végéig, egyedi becsléssel szerepel; ebből nem készül kitalált egynapos esemény. |
| Farer | Előrendelések, évszakos visszatérések és egy novemberi Endeavour IV-jelzés. A részletes Endeavour-oldal webes próbája sikertelen, a jelölt nyitva marad, ebből most nem készül naptárkártya. |
| Studio Underd0g, 2 URL | A Mantis szeptember 1-i kilencórás rendelési ablaka változatlan; nem jelöljük újranyitottnak. |
| NOMOS | A Worldtimer Handelsblatt, aranymodellek és további újdonságok listája látható; a listanézetben nincs igazolt új jövőbeli dátum. |

## Feldolgozási sor és döntések

A [GitHub forrásfigyelő 10. számú feladatát](https://github.com/Tomesztosz/Lumeblog/issues/10)
elolvastuk. A reggeli jelentés 958 függő jelöltet mutatott, a helyi friss
figyelő jelentése 930-at a most felvett döntések előtti állapotban. A két szám
eltérő figyelőállapotból származik, nem 28 kézzel feldolgozott új hír bizonyítéka.
A szeptember 6. utáni új jelöltek és a változott, már felvett részletes oldalak
külön figyelmet kaptak. Nem pipáltunk ki ellenőrizetlen tételeket.

A `calendar-decisions.json` három, indokolt szerkesztői döntéssel bővült:

- [Seiko HDB005](https://www.seikowatches.com/us-en/products/5sports/hdb005): a gyártó valóban 2026. októberi megjelenést ír. A standard Seiko 5 Sports SKX változatot ebben a válogatásban nem emeljük ki. Nem a dátum hiánya miatt marad ki.
- [King Seiko VANAC](https://www.seikowatches.com/global-en/products/kingseiko/special/vanac): a HKF005 számlapváltozatát most nem választjuk külön kártyának. A szomszédos SLA-modellek régebbi dátumait nem ruházzuk át rá.
- [Breitling NFL kollekció](https://www.breitling.com/us-en/watches/nfl-collection/): sportszponzorációs csapatkiadások, most a szerkesztői válogatáson kívül. Ez nem jelenti a teljes külön termékoldal-sor feldolgozását.

Nem került új elem a `releases.json` vagy `announcements.json` fájlba.
A meglévő dátumokat nem változtattuk meg; új ICS nem készült. A megmaradt
jelöltek és a hozzáférési hiányok nem tekinthetők lezártnak.

## Ellenőrzési nyom

- Gépi jelentés: `.calendar-radar/report.json`, `report.md`, `state.json`, csak helyi munkafájlok.
- Böngészős forrásszövegek: `output/article-review/todd-beamer-rolex/calendar-2026-09-14/sources.json`, csak helyi ellenőrzéshez.
- `npm run build`: sikeres. Mindkét nyelvi naptároldal mobilon ellenőrizve, nincs vízszintes túlcsordulás. A meglévő 22 nyelvi ICS letöltése és naptár-/eseményblokkjainak ellenőrzése sikeres.
- Az audit nem módosított vállalati hálózati kategóriát és nem küldött külső felülvizsgálati kérelmet.
