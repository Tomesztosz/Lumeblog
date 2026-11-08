# Kiadás előtti függőségellenőrzés, 2026. november 8.

A november 9., 11. és 13. napjára időzített cikkek tiszta kiadási munkafájában
az `npm ci` három sérülékeny csomagjelzést adott. Ezek a fejlesztői Wrangler,
Miniflare és a közvetett Undici kapcsolatából adódtak.

Az eredeti Undici 7.29.1 javított változata 7.30.1. A meglévő `^4.152.0`
Wrangler-tartományon belüli frissítés 4.158.0-ra vitte a CLI-t, a hozzá
tartozó Miniflare és workerd csomagokkal. Közvetlen verziótartomány,
override és alkalmazáskód nem változott. A generált lockfile egyes opcionális
csomagok fejlesztői besorolását is újraszámolta.

Parancsok a tiszta kiadási munkafában:

```sh
npm update wrangler --package-lock-only --ignore-scripts
npm ci --ignore-scripts
npm audit
npm run build
```

A javított lockfile telepítése nulla ismert sérülékenységet jelzett. Ez célzott
csomagellenőrzés, nem teljes biztonsági audit. A sérülékeny verzióval nem
történt új élesítés. A tulajdonos fő munkafájának más függőségváltozásait
nem másoltuk át és nem írtuk felül.

Elsődleges források:

- [Az Undici TLS-ellenőrzési hibája és javított verziói](https://github.com/advisories/GHSA-2m5v-pch6-74hx)
- [A Cloudflare Workers SDK hivatalos kiadásai](https://github.com/cloudflare/workers-sdk/releases)
