# Céges hozzáférés: Zscaler-besorolás

Állapot, 2026. szeptember 14.: a felhasználó képernyőképén a `Miscellaneous or Unknown` kategória miatti tiltás látszik. Ez nem a Lume szerverének hibaoldala, és önmagában nem bizonyít fertőzést vagy tanúsítványhibát. Átminősítési kérelem még nincs beküldve. A tulajdonos most nincs céges gépnél; a külső böngészőből végzett próba nem adott ellenőrizhető besorolást.

## Teendő a céges gépen

1. Nyisd meg a [Zscaler Site Review](https://sitereview.zscaler.com/) oldalt a szokásos, szabályosan használt céges kapcsolaton.
2. Add meg a `https://lumejournal.com/` és a `https://lumejournal.com/en/` címet. Kattints a **Look Up** gombra.
3. Ellenőrizd az aktuális kategóriát. Javaslatunk a tényleges tartalom alapján: **Hobbies/Leisure**. A Lume órakedvelőknek szóló folyóirat, nem pénzügyi szolgáltatás.
4. A felülvizsgálatnál válaszd a megfelelő kategóriát, a Comments mezőbe másold az alábbi szöveget, és adj meg értesítési email-címet. A **Submit Request** küldi be a kérelmet.
5. Őrizd meg az ügyszámot és az értesítést. A döntés után teszteld újra ugyanarról a céges kapcsolatról.

A felülvizsgálat Zscaler-szolgáltatáson át érkező felhasználóknak érhető el. Nincs garantált elbírálási határidő. A globális besorolás javítása után is tilthat a munkáltató saját szabályzata. [Hivatalos eljárás](https://help.zscaler.com/zia/looking-up-urls-site-review), [kategóriák és helyi szabályok](https://help.zscaler.com/zia/about-url-categories).

### Bemásolható indoklás

```text
Please review the URL categorization of https://lumejournal.com/ and https://lumejournal.com/en/.

Lume is an independent Hungarian and English watch journal. It publishes editorial articles about watches, watchmaking history and mechanical movements, with original interactive educational diagrams. Reading the public website does not require an account.

The block page currently reports "Miscellaneous or Unknown". Based on the site's actual editorial subject, Hobbies/Leisure appears to be an appropriate category. Please assess the site and update the classification if warranted.

This request concerns accurate categorization, not bypassing the organization's access policy.
```

## Ha a Site Review nem nyílik meg

A tiltóképernyőn látható **Open a Support Ticket** útvonalon kérj segítséget a céges IT-tól. Az alábbi szöveget használd a saját belső rendszerükben. Nem küldtünk levelet vagy hibajegyet a nevedben.

```text
Tárgy: Weboldal kategóriabesorolásának felülvizsgálata, lumejournal.com

A https://lumejournal.com/en/ megnyitását a Zscaler "Miscellaneous or Unknown" kategória miatt blokkolja. Az oldal egy magyar és angol nyelvű órás folyóirat, óratörténeti és ismeretterjesztő cikkekkel, interaktív szerkezeti ábrákkal.

Kérlek, ellenőrizzétek a besorolását, és szükség esetén kérjetek kategória-felülvizsgálatot. Tartalma alapján a Hobbies/Leisure kategóriát javaslom. Az esetleges hozzáférés engedélyezését természetesen a céges internethasználati szabályok szerint kérem elbírálni.

Csatolom a tiltóoldal képernyőképét és az észlelés időpontját.
```

A megoldás nem VPN, másik domain vagy a biztonsági ellenőrzés kikapcsolása. A Lume HTTPS-, CSP- és egyéb biztonsági beállításait emiatt nem gyengítjük.
