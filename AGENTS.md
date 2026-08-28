# Lume – kötelező munkafolyamat

A projekt részletes technikai és szerkesztői szabályai a `CLAUDE.md` és a
`lume-brief.md` fájlban vannak. Ezeket minden érdemi módosítás előtt olvasd el.

## Cikk publikálása vagy időzítése

Amikor magyar–angol cikkpár kerül élesre vagy időzítésre, a cikkes feladattal együtt
kötelező a megjelenési naptár ellenőrzése is.

1. Nézd meg a `src/data/brand-radar.json` minden hivatalos forrását, és keress az
   előző ellenőrzés óta bejelentett, még jövőbeli megjelenéseket.
2. Hírt vagy terméket csak akkor tegyél a `src/data/releases.json` fájlba, ha van
   hivatalos gyártói forrása, legalább hónap pontosságú jövőbeli dátuma, és beleillik
   a Lume szerkesztői válogatásába. Dátumot tilos kikövetkeztetni vagy kitalálni.
3. Az új bejegyzéshez kötelező a magyar és angol szöveg, a helyi kép, a képkredit,
   a forrás URL-je, valamint a naptárfájlhoz szükséges összes adat.
4. Akkor is frissítsd a `src/data/calendar-meta.json` `lastReviewed` mezőjét, ha
   nem találtál felvehető bejelentést. Ez jelzi a teljes radar utolsó átnézését.
5. Futtasd az `npm run build` parancsot, ellenőrizd a magyar és angol naptárat,
   valamint az új `.ics` fájlokat. A publikálási összefoglalóban külön írd le a
   naptárellenőrzés eredményét.

Ez a lépés minden hétfői, szerdai és pénteki cikkfolyamat része, nem külön kérhető
extra feladat.
