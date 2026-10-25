# Kirakat · a Lume saját hírlevele

A Kirakat a Lume saját, harmadik féltől független hírlevele. A feliratkozók
listája a Cloudflare-fiókodban él (D1 adatbázis), a felület a Lume része, a
számokat Markdownban írod, és egy paranccsal küldöd ki. Külső szolgáltatás
csak a levelek tényleges kézbesítéséhez kell, „csőként”, az olvasó semmit
nem lát belőle.

Ami a kódban van:

| Fájl | Mit csinál |
|---|---|
| `worker/index.js` | Feliratkozás, megerősítés, leiratkozás, kiküldés (Cloudflare Worker) |
| `worker/mail.js` | A levelek közös sablonja (megerősítő levél és számok) |
| `worker/migrations/0001_kirakat.sql` | Az adatbázis szerkezete |
| `src/components/design/Kirakat.astro` | A kirakat a főoldalon és a Rólam oldalon |
| `src/i18n/ui.ts` → `DESIGN_STUDY.*.kirakat` | Minden felületi szöveg, HU és EN |
| `src/site.ts` → `KIRAKAT_ENABLED` | Ki-be kapcsoló |
| `scripts/kirakat.mjs` | Előnézet, próbalevél, kiküldés, létszám |
| `kirakat/hu`, `kirakat/en` | A számok Markdownban, benne egy minta |

A Worker csak az `/api/*` címeket kapja meg. Minden más oldal ugyanúgy a
statikus `dist/` mappából megy ki, mint eddig, a Worker érintése nélkül.

## Indulás és beállítás

A Kirakat beállítás nélkül indul. Az első telepítéskor a Wrangler magától
létrehozza az adatbázist és a Workerhez köti, a táblákat a Worker hozza létre
az első kéréskor, a leiratkozó linkek aláíró kulcsát pedig maga generálja.

Amíg nincs levélküldő beállítva, a feliratkozások sorba állnak: a cím elmentődik
„függőben” állapotban, és az olvasó azt látja, hogy a megerősítő levél hamarosan
jön. Ezek a címek nem évülnek el. Ha beállítod a levélküldőt, egyetlen paranccsal
kimennek nekik a megerősítő levelek (lásd lent, 4. lépés).

Mindent a projekt mappájából futtass. A `npx wrangler` első futáskor bejelentkezést
kér a Cloudflare-fiókodba. A Worker neve a Cloudflare-en `lumeblog`, ugyanez áll
a `wrangler.toml`-ban is.

### 1. Küldő domain a Resendnél

1. Regisztrálj a [resend.com](https://resend.com) oldalon (ingyenes csomag:
   havi 3000, napi 100 levél).
2. *Domains → Add domain*, és add meg: `lumejournal.com`.
3. A Resend kiír néhány DNS-rekordot (SPF, DKIM). Ezeket a Cloudflare-ben a
   lumejournal.com DNS-beállításainál vedd fel. Várd meg, amíg a Resend
   „Verified”-et mutat. A domain beállításainál a megnyitás- és kattintáskövetés
   maradjon kikapcsolva.
4. *API Keys → Create API key*, csak küldési joggal.

### 2. Titkok

Kell egy hosszú véletlen érték az admin tokenhez:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Aztán:

```bash
npx wrangler secret put ADMIN_TOKEN       # a véletlen érték
npx wrangler secret put RESEND_API_KEY    # a Resend API-kulcs
```

A `KIRAKAT_SECRET` elhagyható: ha nincs, a Worker az első induláskor generál egyet
és az adatbázisban tárolja. Ha később mégis beállítod, a már kiküldött levelek
leiratkozó linkjei érvénytelenné válnak, ezért utólag ne add hozzá.

Az `ADMIN_TOKEN`-t a saját gépeden is tárold, a projekt gyökerében egy
`.env.kirakat` fájlban (a git nem követi):

```
KIRAKAT_ADMIN_TOKEN=ugyanaz-mint-az-ADMIN_TOKEN
```

### 3. Válaszok fogadása

A levelek feladója a `kirakat@lumejournal.com`, ennek nem kell valódi postafióknak
lennie. Hogy az olvasók válaszai (és a törlési kérések) hozzád jussanak, a
Cloudflare-ben a `lumeblog` Worker *Settings → Variables and Secrets* alatt
vegyél fel egy `KIRAKAT_REPLY_TO` titkot a saját címeddel. Minden levél ezt a
címet adja meg válaszcímként. Titokként tárold, ne a `wrangler.toml`-ban, mert
a repó nyilvános.

Fontos: a Cloudflare-felületen minden ilyen értéket **Secret** típussal vegyél fel.
A „Variable” típusú értékek olvashatóan látszanak, és a következő GitHub-telepítés
felül is írja őket.

### 4. A sorban állók megerősítő levelei

```bash
npm run kirakat -- stats           # látszik, hányan várnak, és hogy a küldő be van-e állítva
npm run kirakat -- confirmations   # kiküldi nekik a megerősítő levelet
```

Ha többen várnak a napi keretnél, a parancs kiírja, hányan maradtak, és másnap
ugyanígy folytatható. Ettől kezdve az új feliratkozók azonnal kapják a levelet.

## Egy szám megírása és kiküldése

1. Új fájl: `kirakat/hu/001-valami.md` (a `000-minta.md` alapján). A
   frontmatterben az `issue` a szám azonosítója, ettől tudja a rendszer, kinek
   ment már ki. Ugyanazt az azonosítót ne használd kétszer.
2. A hang ugyanaz, mint a cikkekben: `lume-szemely.md`, `lume-hang.md`, és
   `python hangcheck.py kirakat/hu/001-valami.md`. Kitalált ár vagy tény nem mehet ki.
3. Előnézet böngészőben:
   ```bash
   npm run kirakat -- preview kirakat/hu/001-valami.md
   ```
4. Próbalevél magadnak:
   ```bash
   npm run kirakat -- test kirakat/hu/001-valami.md a-sajat-cimed@pelda.hu
   ```
5. Kiküldés. Először `--yes` nélkül, ez csak kiírja, hány emberhez menne:
   ```bash
   npm run kirakat -- send kirakat/hu/001-valami.md
   npm run kirakat -- send kirakat/hu/001-valami.md --yes
   ```
6. Ha a lista nagyobb a napi keretnél (`KIRAKAT_DAILY_LIMIT`, alapból 80),
   a parancs kiírja, hány címzett maradt. Másnap ugyanezt futtasd, ott folytatja.

Az angol szám ugyanígy megy a `kirakat/en/` mappából. A magyar és az angol
lista külön van: mindenki abban a nyelvben kap levelet, amelyiken feliratkozott.

Létszám bármikor: `npm run kirakat -- stats`

## Átváltás a Cloudflare saját küldőjére

Amikor a lista kinövi a Resend napi 100 levelét, a Cloudflare Email Service
lehet a következő lépés. Ehhez a fizetős Workers csomag kell (benne havi 3000
levél, utána ezrenként 0,35 dollár), és 2026 őszén még béta.

1. Cloudflare → Email Service: a lumejournal.com hozzáadása küldő domainnek.
2. A `wrangler.toml`-ban vedd ki a megjegyzésből a `[[send_email]]` blokkot,
   és írd át: `EMAIL_PROVIDER = "cloudflare"`.
3. Az `src/i18n/ui.ts`-ben a `privacyBody` szövegből (HU és EN) vedd ki a Resendet.
4. Push. A kód többi része nem változik.

## Adatkezelés

- A feliratkozáshoz megerősítés kell (dupla opt-in). Megerősítés nélkül senki
  nem kap hírlevelet. Akik megkapták a megerősítő levelet, de 7 napon belül nem
  kattintottak, azokat a rendszer törli (a takarítás a következő feliratkozáskor
  fut le). A sorban álló, még levelet nem kapott címek addig megmaradnak.
- Tárolt adatok: e-mail cím, nyelv, a feliratkozás és a megerősítés ideje,
  és egy rövid hozzájárulási bejegyzés. A rendszer IP-címet nem tárol. A Resend
  domainbeállításainál a megnyitás- és kattintáskövetés maradjon kikapcsolva,
  így a levelekben nincs követőpixel.
- Minden levélben van leiratkozó link, és a levelezőprogramok egykattintásos
  leiratkozását (List-Unsubscribe) is támogatja.
- Végleges törlés kérésre:
  a Cloudflare-felületen a `lumeblog` Worker *Bindings* fülén látod az
  adatbázis nevét (a Wrangler adta neki), azzal:
  ```bash
  npx wrangler d1 execute <adatbázis-neve> --remote \
    --command "DELETE FROM subscribers WHERE email = 'cim@pelda.hu'"
  ```
- A kirakat alatt rövid tájékoztató van arról, mit tárolsz. Ez nem helyettesít
  egy teljes adatkezelési tájékoztatót. Ha a lista komolyabb lesz, érdemes
  egy külön oldalt írni róla (adatkezelő, cél, jogalap, tárolás ideje,
  adatfeldolgozók: Cloudflare, Resend).

## Biztonság

- A felület a meglévő CSP-n belül fut: a feliratkozás `fetch` hívás a saját
  domainre (`connect-src 'self'`), nincs űrlapküldés és külső szkript.
- Az admin végpontok csak az `ADMIN_TOKEN`-nel érhetők el, időzítésfüggetlen
  összehasonlítással.
- A megerősítő tokent csak hash-ként tárolja, 48 óráig érvényes. A leiratkozó
  link HMAC-kel aláírt, nem lehet más címére kitalálni.
- A feliratkozás válasza nem árulja el, hogy egy cím már fent van-e a listán.
- Robotok ellen: rejtett csapdamező, saját domainről érkező kérés ellenőrzése,
  és címenként 10 perces várakozás két megerősítő levél között.

## Helyi tesztelés

```bash
npm run build
npx wrangler dev --var EMAIL_PROVIDER:log --var ADMIN_TOKEN:helyi \
  --var SITE_URL:http://127.0.0.1:8787
```

A helyi adatbázist a Wrangler magától létrehozza. A `log` küldő nem küld levelet,
a konzolra írja ki, mit küldene, a megerősítő linkkel együtt. A
`--var EMAIL_PROVIDER:log` nélkül azt látod, ahogy élesben levélküldő nélkül
működik: a feliratkozások sorba állnak.
