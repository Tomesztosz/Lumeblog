# Lume – kötelező munkafolyamat

A projekt részletes technikai és szerkesztői szabályai a `CLAUDE.md` és a
`lume-brief.md` fájlban vannak. Ezeket minden érdemi módosítás előtt olvasd el.

## Cikk publikálása vagy időzítése

Amikor magyar–angol cikkpár kerül élesre vagy időzítésre, a cikkes feladattal együtt
kötelező a megjelenési naptár ellenőrzése is.

1. Nézd meg a `src/data/brand-radar.json` minden hivatalos forrását, és keress az
   előző ellenőrzés óta bejelentett újdonságokat, közelgő eseményeket és a már
   felvett bejegyzések változásait. Nézd át az `additionalSources` URL-jeit és a
   Naptár forrásfigyelő GitHub-ellenőrzőlistáját is. Sikertelen letöltésből nem
   következik, hogy nincs új hír: ilyen forrásnál böngészős ellenőrzés szükséges.
2. Hírt vagy terméket csak akkor tegyél a `src/data/releases.json` fájlba, ha van
   hivatalos gyártói forrása, legalább hónap pontosságú jövőbeli dátuma, és beleillik
   a Lume szerkesztői válogatásába. Dátumot tilos kikövetkeztetni vagy kitalálni.
   A már bemutatott vagy dátumra váró, hivatalos forrással igazolt újdonságokat
   az `announcements.json` kezeli, kitalált dátum és ICS nélkül. A részletes
   szabályok és a feldolgozási sor a `docs/calendar.md` fájlban vannak.
3. Az új bejegyzéshez kötelező a magyar és angol szöveg, a helyi kép, a képkredit,
   a forrás URL-je, valamint a naptárfájlhoz szükséges összes adat.
4. Akkor is frissítsd a `src/data/calendar-meta.json` `lastReviewed` mezőjét, ha
   nem találtál felvehető bejelentést. Ez jelzi a teljes radar utolsó emberi
   átnézését. Pusztán gépi letöltés után nem frissíthető. Ha források nem
   ellenőrizhetők, ezt külön jelezd, és ne állíts teljes lefedettséget.
5. Futtasd az `npm run build` parancsot, ellenőrizd a magyar és angol naptárat,
   valamint az új `.ics` fájlokat. A publikálási összefoglalóban külön írd le a
   naptárellenőrzés eredményét.

Ez a lépés minden hétfői, szerdai és pénteki cikkfolyamat része, nem külön kérhető
extra feladat.
