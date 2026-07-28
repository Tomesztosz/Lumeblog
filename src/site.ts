/* ============================================================
   LUME — élesítési kapcsolók
   Egy helyen az a néhány dolog, ami a publikáláskor változik.
   ============================================================ */

/**
 * Az oldal ÉLES: a keresők indexelhetik, a robots.txt engedélyező.
 *
 * Ha valamiért vissza kell venni (nagyobb átalakítás, jogi kérés egy képre),
 * elég ezt `false`-ra állítani: onnantól minden oldal `noindex`, és a
 * robots.txt mindent tilt. A már beindexelt oldalak kiesése napokat vesz
 * igénybe, tehát ez nem azonnali visszavonás.
 */
export const LAUNCHED = true;

/**
 * A hírlevél EGYELŐRE NINCS KIRAKVA az oldalra — nincs mit kiküldeni, amíg
 * csak pár cikk van. A `Subscribe.astro` komponens készen áll; visszatenni
 * két lépés: importáld a `HomeView.astro`-ba és/vagy az `AboutView.astro`-ba,
 * és tedd be a `<Subscribe lang={lang} />` sort a `.ethos-follow` bekezdés
 * helyére. Addig az olvasó RSS-sel tud követni.
 *
 * A MailerLite beágyazott űrlapjának `action` URL-je, ha eljutunk odáig.
 * Honnan: MailerLite → Forms → Embedded forms → (új űrlap) → a kapott HTML-ben
 * a `<form action="...">` értéke. Nagyjából így néz ki:
 *   https://assets.mailerlite.com/jsonp/123456/forms/789012345/subscribe
 */
export const MAILERLITE_FORM_ACTION = '';
