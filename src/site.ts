/* ============================================================
   LUME — élesítési kapcsolók
   Egy helyen az a néhány dolog, ami a publikáláskor változik.
   ============================================================ */

/**
 * Amíg `false`, minden oldal `noindex`, és a robots.txt mindent tilt.
 * A domain megvásárlása és az első cikk után állítsd `true`-ra — ez az
 * egyetlen kapcsoló, ami az oldalt keresőknek láthatóvá teszi.
 */
export const LAUNCHED = false;

/**
 * A MailerLite beágyazott űrlapjának `action` URL-je.
 *
 * Honnan: MailerLite → Forms → Embedded forms → (új űrlap) → a kapott HTML-ben
 * a `<form action="...">` értéke. Nagyjából így néz ki:
 *   https://assets.mailerlite.com/jsonp/123456/forms/789012345/subscribe
 *
 * Amíg üres, a feliratkozó sáv csak felület: az e-mail nem hagyja el az oldalt.
 */
export const MAILERLITE_FORM_ACTION = '';
