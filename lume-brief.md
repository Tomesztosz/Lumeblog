# Lume — projekt brief

**Mi ez:** Kétnyelvű (HU / EN) órás blog/napló. Cél: a tulaj tudásának bővítése az órákról (márkatörténelem, mérnöki háttér), és hogy az elmélyülni vágyók is olvashassák. Heti 3 poszt.

**Név:** *Lume* — a számlap sötétben világító anyaga. Egyszavas, mindkét nyelven ugyanaz. Generikus szakszó (nehéz védjegyezni, SEO-ban zajos), de hobbiblognak vállalható.

## A három rovat (a „heti három")
- **Kézben / In Hand** — a hét microbrandje, kézbe véve.
- **Eredet / Origins** — márkatörténelem, a legenda mögötti tényekkel.
- **Szerkezet / Movement** — mérnöki megközelítés, egy komplikáció/alkatrész lebontva (gátlómű, kronográf, GMT, spirál).
- *Ritka különkiadás ötlet:* „Órák mint érték" — a tulaj kvantitatív pénzügyes háttere miatt egyedi szög.

## Szerkesztői elv / hangnem
Nincs megjelenésnapi hajsza, nincs hype. Mélység, mesterség, „a tárgy > a hírek". Researchben pontosság kötelező — kitalált forrás vagy tény tilos.

## Design-nyelv
- **Hangulat:** vintage, meleg örökség. Alapból „nappali", világos nézet.
- **Aláírás-elem:** „Lámpa le" kapcsoló → az egész oldal meleg gyertyafény-sötétbe vált, és a számlap-indexek, a mutatók, a LUME felirat és a rovatcímkék öreg Super-LumiNova zölddel derengeni kezdenek. Ez az egyetlen „bátor" elem; körülötte minden csendes.
- **Tudatosan NEM** a szokásos krém + terrakotta AI-klisé — helyette sárgaréz + öreg-lume zöld, a névből levezetve.
- **Vezérgondolat (fény → olvasható → megértés):** a lume olvashatóvá teszi a számlapot sötétben → a napló olvashatóvá teszi magukat az órákat. Innen a hero cím: „Tanulj meg órát olvasni." / „Learn to read a watch."
- **Paletta — világos:** papír `#E6DAC1`, kártya `#EFE6D2`, tinta `#2A231D`, halk tinta `#6A5E50`, sárgaréz `#8F6E31` / mély `#6F5424`, lume-jel `#7B885A`.
- **Paletta — sötét (lámpa le):** háttér `#13100B`, kártya `#1B1610`, tinta `#B6AB94`, lume-derengés `#CDE9A0`.
- **Betűk:** Fraunces (címek — meleg, vintage talpas), Hanken Grotesk (szövegtörzs), IBM Plex Mono (címkék, dátumok, technikai adatok).
- **Képek:** most SVG-motívumok állnak a fotók helyén (semmi külső/jogvédett kép); a valódi makrófotók helye kijelölve.

## Jelen állapot — nyitóoldal (`index.html`)
Kész az egyfájlos, önálló nyitóoldal:
- fejléc HU/EN nyelvváltóval és „Lámpa le" kapcsolóval,
- hero: cím „Tanulj meg órát olvasni.", a ráhangolt lede, és egy **valós, aktuális időt mutató** számlap-SVG (folyamatosan frissül; csökkentett mozgásnál másodpercenként lép),
- a három rovat + 3 minta-poszt (valós, ellenőrizhető órás sztorikra utalva),
- „amiben hiszünk" + hírlevél sáv, footer.
- A hero „lámpa" linkje **állapotfüggő**: sötétben „vagy kapcsold fel a lámpát" (angolul is), és oda-vissza kapcsol.
- A „heti három" témát **egyetlen** helyen emeljük ki (a rovatok címeként), nem szórjuk szét.
- Nincs localStorage.

## Platform / közzététel — döntés: **Astro** (statikus oldal-generátor)
Miért: 1:1-ben megőrzi a mostani dizájnt (a HTML/CSS sablonná válik), beépített kétnyelvűség (i18n), Markdown-alapú írás, ingyenes tárhely (Netlify/Cloudflare), alig karbantartás.
- **Publikálás:** egy poszt = egy Markdown-fájl (frontmatter: cím, dátum, rovat, nyelv; alatta a szöveg), git-tel feltöltve → magától megjelenik a megfelelő listában.
- **Hírlevél:** „jó lenne, de nem kritikus" — később külön szolgáltatásra kötjük (pl. Buttondown / MailerLite); a meglévő feliratkozó-sávot akkor bekötjük.
- **Sitemap:**
  - `/` — főoldal (a mostani nyitóoldal alapján).
  - `/kezben`, `/eredet`, `/szerkezet` — rovat-listaoldalak (ide visznek a menüpontok — így nyer értelmet a menü).
  - cikkoldal, pl. `/kezben/lorier-neptune` — poszt = Markdown-fájl.
  - `/rolam` — Rólam oldal.
  - Mindez kétnyelvűen (HU/EN).

## Következő lépések
1. **Astro-váz felállítása Claude Code-ban** a mostani `index.html`-ből (layout + design tokenek), rovatonként 1-1 minta-cikkel.
2. Belső oldalak: poszt-sablon + rovat-listaoldal + Rólam.
3. Valódi fotók beépítése; logó / wordmark.
4. Hírlevél bekötése (Buttondown / MailerLite).
5. Blogírás és research támogatása (később Coworkben).

## Hogyan dolgozz velem ezen
Magyarul válaszolj. Tartsd a fenti design-nyelvet és palettát. A weboldal alapja az egyfájlos `index.html` — módosításkor abból indulj ki. A build Astróban, Claude Code-ban zajlik; ott ez a fájl a `CLAUDE.md` alapja is lehet.
