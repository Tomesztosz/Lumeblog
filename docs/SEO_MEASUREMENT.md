# Keresési mérés, P3

2026. október 18. A mérési tervhez a `design-kpis` útmutató elveit alkalmaztuk:
kevés döntéstámogató főmutató, pontos adatforrás, külön diagnosztikai mutatók,
értelmezési korlátok. Ez nem meglévő látogatottsági adatok elemzése.

## Hozzáférés és a mérés határa

A repóban nincs aktív analitikai integráció vagy Search Console/Bing olvasó.
A rendelkezésre álló eszközök között sem volt ilyen fiókolvasási képesség.
Ez nem bizonyítja, hogy a tulajdonosnak nincs ellenőrzött fiókja, DNS-alapú
ellenőrzése vagy Cloudflare-mérése. Új követőkód, külső adatküldés és új
szolgáltatás nem került be. A forgalmi alapállapot jelenleg **ismeretlen**.

Az eredeti export az irányadó, nem egy általános kulcsszóeszköz becslése.
A technikai buildellenőrzés nem helyettesíti az indexelési jelentést.

## Mit érdemes mérni?

| Szerep | Mutató és számítás | Mire ad választ? | Korlát |
| --- | --- | --- | --- |
| Főmutató | Google/Bing organikus kattintások, szolgáltatásonként | Több olvasó jut-e keresésből az oldalra? | Nem olvasási minőség vagy megtartás; az export lehet részleges |
| Főmutató | Nem Lume-márkás lekérdezések kattintásai, ha van lekérdezésdimenzió | Új, témát kereső olvasókat érünk-e el? | Anonimizált lekérdezések hiányozhatnak; az Omega nem Lume-márkakeresés |
| Külön kísérleti láthatóság | Google AI-megjelenések és Bing idézések, külön | Megjelennek-e a cikkek ezeken a felületeken? | Nem összeadható a normál kereséssel, és nem jelent látogatást |
| Diagnosztika | Megjelenések; CTR = összes kattintás / összes megjelenés | Láthatóság vagy átkattintás változott? | A CTR nem soronkénti százalékok átlaga; nulla megjelenésnél nincs CTR |
| Diagnosztika | Átlagpozíció, megjelenésszámmal súlyozva | Milyen keresési helyzetben keletkeztek a megjelenések? | Nem univerzális helyezés; csak a pozícióval rendelkező sorokra érvényes |
| Technikai védőkorlát | Hibás belső link, kiszivárgó piszkozat, hibás nyelvi pár | Megbízható maradt-e a publikálás? | Buildállapot, nem keresőbeli indexelés |
| Élményvédőkorlát | Mobil/desktop terepi LCP, INP, CLS p75 | Használható marad-e az oldal? | Valódi CrUX/RUM szükséges; laborból nem állítunk terepi megfelelést |

Forgalomnövekedési célszámot alapállapot nélkül nem adunk. A technikai kapu
nulla hibás linket és nulla idő előtti publikációt vár el. A terepi CWV
tájékozódási értékei: LCP legfeljebb 2,5 s, INP legfeljebb 200 ms, CLS
legfeljebb 0,1 a látogatások 75. percentilisén, eszköztípusonként.
Forrás: [Web Vitals](https://web.dev/articles/vitals).

A `Lume Journal` és `lumejournal.com` kifejezett kiadói keresésnek jelölhető.
Az önálló `lume` órás anyagnév is, ezért `ambiguous-lume` kategóriába kerül,
és nem adódik automatikusan a márkás vagy nem márkás főmutatóhoz.

## Egyszerű helyi import

1. Search Console-ban válaszd ki a Lume tulajdont, a jelentést, a szűrőket
   és egy teljes, lezárt 28 napos időszakot. Exportáld a **Pages/Oldalak**
   táblát CSV-ként. A lekérdezéstábla nem kapcsolható össze utólag a
   külön oldaltáblával: az nem valódi oldal-lekérdezés kapcsolat.
2. Tedd a CSV-t a helyi `.seo-private/` mappába. Ide másold a
   `docs/seo/measurement-manifest.example.json` mintát is. A minta szándékosan
   nem tartalmaz kitalált dátumot vagy forgalmi sort, kitöltésig nem futtatható.
3. Írd be a valós időszakot, exportidőt, fájlnevet, jelentést és szűrőket.
   A `columns` mezőbe a CSV tényleges fejlécnevei kerüljenek. Magyar exportnál
   is megadhatók magyar fejlécnevek. A számlálók ne tartalmazzanak ezres
   elválasztót, a tizedesjel pont legyen. A CSV idézőjeleit ne töröld.
4. A `grain` soronkénti egyediséget jelent. Pages-táblánál `['url']`,
   valódi együttes API-/adatbázis-exportnál például `['date','url','query']`.
   Nap nélküli táblánál minden sor a teljes megadott időszak összesítése.
   Ország/eszköz dimenzió csak akkor szerepeljen, ha a sorokban tényleg ott van.
5. Futtasd a friss build után:

```powershell
npm run seo:measure -- --manifest .seo-private/current/manifest.json
npm run seo:measure -- --manifest .seo-private/current/manifest.json --baseline .seo-private/before/manifest.json --window 28
```

A jelentés a `.seo-private/reports/` alá kerül, **nem a webhelyre**. A
nyers export és a privát jelentés Gitből kizárt. Ne tedd őket a `public/`,
`src/data/` vagy verziózott dokumentáció alá. A script nem kér és nem
tárol tokent, nem olvas fiókot, nem küld adatot. A jelentés neve egyedi,
nem írja felül az előző állapotot.

### Ellenőrzési szabályok

- Valós naptári dátum, ismert időzóna, lezárt időszak és tényleges exportidő kell.
- Duplikált sorazonosság, elcsúszott CSV-sor, hiányzó számláló, idegen domain,
  URL-be írt hitelesítő adat és hibás szám esetén leáll az import.
- A mérés saját HTTPS canonical URL-t vár, query és fragment nélkül.
  A régi/átirányított vagy a jelenlegi buildből hiányzó URL nem kap kitalált
  tartalmi besorolást. Hiányzó buildnél előbb építeni kell.
- A hiányzó sor nem nulla. A csak az előző időszakban szereplő oldalak külön,
  ismeretlen jelenlegi értékkel szerepelnek. Üres táblából nem lesz nulla forgalom.
- A CTR újraszámolódik. A pozíció súlyozott, hiányzó pozíció esetén külön
  látszik, hány megjelenésre vonatkozik. Más jellegű AI-mutatóból nem készül CTR.
- Az összesítés mindig az **exportált sorokra** vonatkozik. A GSC anonimizálása,
  felső sorlimitjei és dimenziói miatt ez eltérhet a tulajdon összesített
  jelentésétől. Forrás: [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query).
- Külön exportok és szűrők nem adódnak össze automatikusan. Különböző
  forrás/szűrő/időzóna/dimenzió/felület esetén nincs összehasonlítás.

## Jelentések elkülönítése

Egy manifest pontosan egy felületet ír le. Klasszikus keresésnél `web`,
`image`, `discover` vagy `multimodal` használható Google-forrással; Bingnél
`web` vagy `image`. A szükséges mutatók `clicks`, `impressions`, opcionálisan
`position`. A natív export CTR-oszlopa nem kötelező, a script újraszámolja.

Google AI Search: `google-ai-search`; Google AI Discover: `google-ai-discover`.
Ezeknél csak `impressions` importálható. A Google 2026. június 3-i közlése
és augusztus 31-i frissítése szerint ez külön láthatósági nézet, amelynek
adatai a teljesítmény összesítésében is szerepelnek. Nem második, hozzáadható
forgalomforrás. [Hivatalos közlés](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).

A multimodális adatot a tényleges Search Console-szűrőből kell exportálni,
és a `filters` mezőben is rögzíteni. Nem feltételezünk hozzá automatikusan
elérhető API-t. [Google multimodális jelentés](https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc).

Bing AI: `bing-ai`, mutatója `citations`. Az idézés nem kattintás, rangsor
vagy tekintélypontszám. A [Topics Portfolio béta](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/)
közelítő témaméretei és tartományai nem kerülnek pontos számlálóként az importba.
Azokat külön, eredeti exporttal/képernyőképpel és bizonytalansági megjegyzéssel
kell szerkesztőileg értékelni. A felület kisebb oldalnál hiányozhat.

## Időbeli összevetés és döntés

A következő felülvizsgálatok a kiadási dátumtól számolva: 2026. november 15.
(28 nap), 2027. január 18. (3 hónap), 2027. április 18. (6 hónap).
Ezek felülvizsgálati időpontok, nem automatikusan létrehozott emlékeztetők.
Mindig lezárt, rendelkezésre álló adatokkal dolgozzunk; a kereső késhet.

Az import `--window 3m` és `--window 6m` kapcsolója naptári hónapot használ.
Nap alapú, közelítő összevetéshez külön `90` és `180` adható meg. A nap nélküli
export időszakának pontosan illeszkednie kell az ablakhoz; a script nem oszt
vissza kitalált napi adatot. Napi exportból az időablak szűrhető.
Eltérő hosszúságú hónapos ablaknál a napra vetített ráta is szerepel.

Előbb azonos nyelvet, oldaltípust és felületet nézzünk. Külön jelöltek az
új publikációk, az aktuális buildben nem talált URL-ek és a hiányzó
lekérdezések. Szezonalitás, indexelési késés, keresőfrissítés és kis minta
hatását vizsgálni kell. A változás nem bizonyítja a SEO-fejlesztés okozati hatását.

## Opcionális szerkesztői lehetőséglista

A konfiguráció `docs/seo/measurement-policy.json`. Csak ismert canonical
oldal és tényleges kattintás/megjelenés alapján készül pontszám:

`log(1 + megjelenések) × (1 − CTR) × (1 + visszaesési_súly × kattintáscsökkenés_aranya) × illeszkedés / ráfordítás`

Az alapértelmezett legalább 100 megjelenés termékdöntés a zajos apró minták
kiszűrésére, **nem statisztikai szignifikancia vagy Google-paraméter**.
A ráfordítás és illeszkedés alapértéke semleges 1, nem mért tény. Útvonalanként
felülírhatók szerkesztői mérlegeléssel. Új cikk nem kap összehasonlítható
korábbi kitettségre épülő pontot. A lista nem keresési volumen, nem becsült
növekedés, és nem indít automatikus cikkírást vagy átírást.

Az új publikációt a jelentés saját időzónájában vizsgáljuk. A baseline
közben megjelent cikk is részleges korábbi kitettségnek számít, nem csak
az, amely az alapidőszak utolsó napja után született.

Eltérő hosszú hónapos ablaknál a pontszám visszaesési tényezője azonos
napszámra vetített korábbi kattintást használ; a nyers időszakos mutatók
és a napra vetített ráták ettől elkülönítve maradnak.

## Tulajdonosi felületen maradó feladatok

Search Console és Bing domain-tulajdon, sitemap-beküldés, URL Inspection,
indexelési jelentések és a Google generatív részvételi beállítása továbbra is
fiókhozzáférést igényel. A működő sitemap címe:
`https://lumejournal.com/sitemap-index.xml`. Legalább egy HU és EN cikk,
modell, rovat, naptár ellenőrzése indokolt. DNS-ellenőrző értéket nem találunk ki.
CrUX/terepi p75-adatot és valós INP-t nem igazoltunk ebből a hozzáférésből.
