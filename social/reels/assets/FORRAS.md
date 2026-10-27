# Hangforrás

`eredeti-light-switch-off-86314.mp3`: lámpakapcsoló, lekapcsolás.
A tulajdonos választotta a Lume „lámpa le” hangjának (2026. október 27.).

Feltöltő: freesound_community, Pixabay (fájlazonosító: 86314).
A Pixabay tartalomlicence a letöltött hangokat kereskedelmi célra is engedi,
forrásmegjelölés nélkül. A konkrét fájl letöltési oldalán érdemes egyszer
ellenőrizni, hogy ez rá is így vonatkozik-e.

A feldolgozás a `sound.py` `load_switch()` függvényében van: a klikk elé vágva,
90 Hz alatti szűrés, rövid be- és kiúsztatás, enyhe telítés (tanh), hogy a
klikk teste kb. 4 dB-lel a ketyegés fölött szóljon torzítás nélkül.
Az eredeti fájl változatlanul itt marad.
