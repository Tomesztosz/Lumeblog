# Az új Lume kiadási naplója

Élesítés előtti jegyzőkönyv, 2026. szeptember 12. Az elfogadott megjelenés
bekötve a normál útvonalakra. A tulajdonos a célzott függőségjavítást,
az újraellenőrzést és az azt követő élesítést jóváhagyta: „rendben csináld meg”.
Cikk, dátum és naptáradat nem módosult. A push utáni tényleges kiszolgálást
külön kell ellenőrizni; a sikeres helyi build önmagában nem élesítési bizonyíték.

## Megtekintés

A kész build helyi kiszolgálása: `npm run preview -- --host 127.0.0.1 --port 4333`.

- Magyar: http://127.0.0.1:4333/
- Angol: http://127.0.0.1:4333/en/
- Műhely: http://127.0.0.1:4333/muhely/
- Naptár: http://127.0.0.1:4333/naptar/

A fejlesztői szerver a 4332-es porton szintén az új felületet mutatja a normál
címeken. A külön `/design/magyar/` és `/design/english/` előnézet megmaradt,
csak fejlesztői módban; a kiadási buildbe nem kerül be. A 127.0.0.1 címek
csak ezen a számítógépen érhetők el, telefonról nem.

### Telefonos próba – tulajdonosi jóváhagyás

A tulajdonos kérésére külön statikus példány indult a helyi hálózati címen:
http://192.168.1.131:4334/ (Node-folyamat: 816). Csak erre az IP-re figyelt,
nem minden hálózati felületre. A próba lezárásakor a folyamat és a port
azonosságát ellenőriztük, majd ezt a példányt leállítottuk. A telefonos cím
már nem aktív. Az eredeti 4332/4333-as szerverek megmaradtak.
A meglévő Windows-tűzfalszabály engedi a Node-ot; tűzfal-, hálózatiprofil-
vagy routerbeállítás nem változott. Internetes alagút és publikálás nem történt.

A gépről ellenőrizve HTTP 200-at adott, az új normál sablonnal. A tulajdonos
a telefonos próba után ezt jelezte: „Rendben átnéztem, minden rendben”.
A saját telefonján végzett áttekintés ezzel elfogadott, bejelentett hiba nincs.
A készülék, a böngésző és a kipróbált funkciók tételes listája nincs megadva;
ebből nem állítunk teljes iPhone/Android- vagy akadálymentességi lefedettséget.

A próba sima HTTP-n futott. A HTTPS-hez kötött funkciók, például a vágólap-API,
így nem voltak teljesen ellenőrizhetők; a böngésző biztonsági korlátozása nem azonos
az éles, HTTPS-es oldal hibájával.

## Bekötés és megőrzött működés

- A `src/pages/` fájlok továbbra is csak útvonalat választanak. A közös belépő
  `src/components/journal/JournalPage.astro`, a megjelenést a már elfogadott
  `src/components/design/` komponensek adják.
- A régi `src/components/views/` sablonok és `src/layouts/Base.astro` megmaradtak.
  A régi 404 a `views/NotFoundView.astro` fájlban is elérhető. Nem töltődnek be
  az új oldalakba, így a régi globális CSS nem keveredik az újval.
- `JournalHead.astro` és `src/lib/journal-metadata.ts` őrzi a korábbi címeket,
  canonical és hreflang párokat, teljes strukturált adatokat és megosztási
  képeket. A látható cikkfotó lehet az elfogadott új válogatásból, a korábbi
  megosztási kép és képadat változatlan marad.
- Az URL-választás kérésenként elkülönített (`Astro.locals.lumePreview`), nem
  közös módosítható globális állapot. A normál oldalak nem hivatkoznak a
  `/design/` előnézetre; az előnézeti sáv és 404-próbalink nem kerül ki.
- A normál felület megőrzi a korábbi `lume-theme` helyi tárolási kulcsot és
  a böngészőfülek közötti témaváltást. Az előnézet saját munkamenet-beállításai
  ettől külön maradnak. Az iOS dokumentumháttér-kezelése megmarad.
- Az eredeti `/widgets/*.html` modellcímek, nyelvek, szkriptek és SVG-geometriák
  változatlanok. A hét HTML csak egy stíluslinket és egy body-jelölőt kapott.
  A `/widgets/journal.css` a közös palettából épül, a publikus és előnézeti
  iframe-ek külön útvonal-engedélylistát használnak.
- A képnéző képeleme csak megnyitáskor jön létre. Az üres, méret nélküli
  képhely nem kerül a keresőknek kiszolgált HTML-be. A képkredit megmarad.
- A közös 404 kétnyelvű segítséget ad, és az ismeretlen útvonalakra HTTP 404-et.
  Az Astro statikus előnézetében a közvetlen `/404.html` fájlkérés HTTP 200;
  ez nem azonos az ismeretlen útvonalak hibaválaszával.

## Ellenőrzések

```sh
npm run build
node scripts/check-design-release.mjs --against .codex-work/design-release-before.json --preview http://127.0.0.1:4332
node scripts/check-journal-build.mjs http://127.0.0.1:4333
```

A kiindulási alap az átállás előtti helyi buildből készült, és nincs felülírva.
Az első ellenőrző eszköz nem élesít és nem fogad el automatikusan eltéréseket.
A `check:journal` célzott tesztjei és statikus buildellenőrzése a normál
`npm run build` részei, a naptár-, SEO- és biztonsági ellenőrzések után.

Eredmények:

- 59 publikus oldal kereső- és megosztási adatai változatlanok.
- Ugyanaz a 90 HTML/XML/ICS-útvonal; 26 RSS-, sitemap-, naptár-, robots- és
  biztonságifejléc-fájl ellenőrzőösszege változatlan.
- 27 célzott teszt sikeres, beleértve a publikus és előnézeti modellhidak
  eredet-, küldőablak-, útvonal- és magasságellenőrzését.
- 59 kiadási oldal HTTP-válasza egyezik a kész builddel. Mind a 14 modellnyelvi
  cím, 28 indítóvezérlő és az öt hivatkozott JS/CSS-fájl ellenőrizve.
- Két ismeretlen HU/EN útvonal a saját, noindex 404-es oldalra vezet.
- A külön előnézet 62 oldala és 3476 belső hivatkozása továbbra is hibamentes.
- A teljes build: SEO-ellenőrzés 42 cikknyelvi változattal és 3188 belső linkkel;
  66 CSP-védett HTML; 20 érvényes kétnyelvű ICS-fájl. A naptári radar
  szerkesztői átnézésének dátuma nem változott, mert ez nem cikkpublikálás.

Az Astro helyi statikus előnézete nem emulálja a Cloudflare `_headers`
válaszfejléceit. A modell-noindexet és a fejléceket a buildfájlokban ellenőrizzük,
a CSP metaelemek minden HTML-ben benne vannak. HTTP-ellenőrzésből nem következik,
hogy a JavaScript, az érintés vagy a képernyőolvasó működése is le lett tesztelve.

## Ismert tesztlefedettségi korlátok

1. Új böngészős próba 320/390/1440 pixelen, mindkét nyelven és témában:
   navigáció, keresés, szűrés, képnéző, Escape/fókusz, témamegőrzés, valamint
   mind a hét modell indítása, bezárása, magassága és önálló megnyitása.
2. A saját telefonos áttekintés elfogadott. A több készülékre kiterjedő
   iPhone/Safari és Android/Chrome lefedettség, a kész builden friss axe-próba
   és a képernyőolvasós ellenőrzés továbbra sincs igazolva. A korábbi előnézeti
   eredmények nem helyettesítik ezt. A környezet tiltja az automatikus
   böngészőindítást.

## Kiadás és visszaállítás

- A kiinduló main: `b3051d3` (szeptember 11-i időzített újraépítés).
- Biztonsági javítást megtartó régi felület: `97ce0f4c82496a3fd8e9a29079174ec90f3c2248`.
  Az SVGO 4.0.2 helyett 4.1.0; a friss audit nulla ismert sérülékenység.
  A javítás külön commit, nem része a felületet átállító commitnak.
- A régi és az új felület külön, csak verziókövetett fájlokat tartalmazó
  munkapéldányban sikeres `npm ci`, audit és teljes build ellenőrzést kapott.
  A tiszta Windows-checkout feltárt egy korábbi CRLF-kezelési hibát a
  biztonságifejléc-ellenőrzőben. Javítva, LF/CRLF regressziós teszttel;
  az éles fejlécszabályok és a CSP működése nem változott (`dc84b8a`).
  A tiszta régi/új build összevetése: 59 oldal metaadata, 90 útvonal,
  26 védett fájl változatlan; a korábbi helyi alapellenőrzés szintén sikeres.
- A felületet bevezető commit: `a5ce21b`. A `git revert a5ce21b` ténylegesen
  lefutott a külön helyi munkapéldányban; az így kapott `b4bf2a6` teljes
  buildje sikeres. A visszaállítási próba nem került a main ágra vagy élesbe.
  A visszaállított fa az SVGO-frissítés melletti régi felület, a sortörésjavítással.
- A meglévő GitHub main → Cloudflare automatikus élesítési útvonal marad.
  A helyi Wrangler nincs hitelesítve; szolgáltatói verzióazonosítót vagy
  kipróbált Cloudflare-rollbacket ezért nem állítunk.
- Forrásalapú visszaállítás: tiszta main munkapéldányban `git revert a5ce21b`,
  majd `npm ci`, `npm audit --audit-level=low`, `npm run build` és `git push origin main`.
  Nincs force push vagy előzménytörlés; az SVGO javítása megmarad.
  Ez újraépítéses visszaállítás, nem azonnali szolgáltatói verzióváltás.
- A Cloudflare felületén az előző kiadási verzió is választható, ha a tulajdonos
  hozzáfér: [hivatalos visszaállítási útmutató](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).
  Ezt az eljárást a jelen munkamenetben nem hajtottuk végre.
