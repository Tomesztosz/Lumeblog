# Biztonsági beállítások

Ellenőrzés: 2026. szeptember 6. A Lume statikus Astro-oldal, amelyet a Cloudflare Workers Static Assets szolgál ki. Nincs saját bejelentkezés, adatbázis, hozzászólás vagy aktív hírlevélűrlap. Az ellenőrzés a projekt kódjára, függőségeire, buildjére, nyilvános kiszolgálására és a hozzáférhető GitHub-beállításokra terjed ki. Nem teljes körű behatolási teszt és nem biztonsági garancia.

## Javítások

- Astro 5.18.2 helyett 7.3.1, frissített képkezelő és kapcsolódó függőségek. Az npm audit a javítás előtt öt érintett csomagot jelzett, utána nullát. Ez ismert csomagsérülékenységek ellenőrzése, nem öt bizonyítottan kihasználható hiba az éles oldalon. Több Astro-figyelmeztetés kizárólag szerveroldali funkciót érintett, amelyet itt nem használunk.
- A Markdown-feldolgozó és a szóközkezelés kifejezetten a korábbi működést őrzi. A képek, cikkdátumok és fordítások változatlanok.
- A `public/widgets/frame-bridge.js` közösen kezeli a modellek üzeneteit. Mindkét irányban ellenőrzi az eredetet és a tényleges küldőablakot. Csak saját `/widgets/*.html` modell kommunikálhat a szülővel. Nincs `*` célcím, a fényállapot csak logikai érték, a magasság véges szám lehet 1 és 6000 között.
- A `public/_headers` tartalmazza a MIME-ellenőrzést, a saját oldalra korlátozott beágyazást, a referrer-szabályt és a nem használt készülékengedélyek tiltását. A saját domain egyéves HSTS-t kap, aldomain-kényszer és preload nélkül. A HTTP-ről HTTPS-re átirányítás már korábban működött.
- Az `.env` változatok és a tipikus privát kulcsfájlok kizárva a verziókövetésből. A buildellenőrzés ismert kulcs- és tokenmintákat keres a követett szöveges fájlokban, a talált értéket sosem írja ki. Nem vizsgálja a teljes Git-előzményt, és nem ismer fel minden lehetséges titokformátumot.

## Tartalombiztonsági szabályzat (CSP)

Az `npm run build` az Astro után a `scripts/secure-build.mjs` lépést is futtatja. Ez minden elkészült HTML-be, az önálló modellekbe és a 404-be is korai CSP metaelemet tesz. Az engedélyezett inline scriptek és stílusblokkok hash-e az adott fájl tényleges, böngésző által értelmezett tartalmából készül. A forrás HTML-t nem formázza át.

Az oldal csak saját szkripteket és az ellenőrzőösszeggel engedélyezett inline kódot futtathat. Nincs `unsafe-eval`, inline eseményattribútum vagy tetszőleges külső script. A képek és betűk helyiek lehetnek; ezeknél a beágyazott `data:` formátum is engedélyezett. A dinamikus képméretekhez és modellanimációkhoz szükséges `style` attribútum megengedett, a JavaScriptre ez a kivétel nem vonatkozik.

Az általános HTTP-fejléc külön tiltja az idegen oldalba ágyazást (`frame-ancestors`), az objektumokat, a base URL átírását és az űrlapküldést. A teljes, oldalanként eltérő hash-lista metaelemben marad, így nem ütközik a Cloudflare `_headers` fájljának 100 szabályos és soronként 2000 karakteres korlátjába. A két szabályzat együtt érvényes. A böngésző végzi az ellenőrzést, nem a robots.txt.

Fontos korlát: a build megbízható, verziókövetett kódból dolgozik. A CSP nem védi meg a látogatót egy szándékosan rosszindulatú forráskód-commit ellen. A modellek első félhez tartozó saját kódok; az `allow-scripts allow-same-origin` sandbox nem valódi izoláció a saját oldaltól. Külső vagy feltöltött, nem megbízható modellekhez külön eredet és más integráció kell.

Hírlevél, analitika, külső videó vagy új szolgáltatás bekötésekor célzottan kell bővíteni a szabályokat és újratesztelni. Ne oldd fel általánosan `*` vagy JavaScripthez `unsafe-inline` engedéllyel.

## Folyamatos ellenőrzés

```sh
npm ci
npm audit
npm run build
```

Az `npm run build` a SEO-ellenőrzés mellett a `check:security` teszteket is futtatja. Ezek ellenőrzik a hash-eket, a tiltott HTML-mintákat, a fejlécszabályokat, az üzenetküldés bizalmi határait és a kiszolgálandó fájlokat. Az időzített, még nem nyilvános cikkeket továbbra is külön SEO-teszt védi.

A GitHub `Build and security checks` munkafolyamata push, pull request és heti futás során telepít a lockfile-ból, npm auditot és teljes buildet végez. Csak olvasási jogosultságot kap, nem tárolja a checkout hitelesítését. Az időzítő megőrzi a működéséhez szükséges írási jogot. Az Actions-függőségek teljes commitazonosítóra rögzítettek.

A Dependabot heti verzióellenőrzést kapott. A repó sérülékenységi értesítései és biztonsági javítási javaslatai bekapcsolva; automatikus összevonást nem állítottunk be. A titokellenőrzés és a push protection már aktív volt. A GitHub-ellenőrzés önmagában nem jelent kötelező élesítési kaput: az automatikus Cloudflare-build továbbra is a meglévő main-push folyamatot követi.

## Amit a tulajdonossal kell ellenőrizni

- Cloudflare-, GitHub- és domainregisztrátori fiók kétlépcsős védelme, helyreállító kódjai és hozzáférései.
- Cloudflare-fiók WAF-, botvédelmi és riasztási beállításai. Ezeket nem módosítottuk hozzáférés nélkül.
- Branch protection és kötelező jóváhagyás, ha később több szerkesztő dolgozik a repóban. Bevezetésüket össze kell hangolni az időzítő jogosultságaival.

## Hivatkozások

- [Astro 7 migráció](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [MDN: postMessage biztonsági szempontok](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Cloudflare: statikus fájlok fejlécei](https://developers.cloudflare.com/workers/static-assets/headers/)
- [GitHub: Dependabot beállítások](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
