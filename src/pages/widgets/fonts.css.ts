import serif from '@fontsource-variable/fraunces/opsz.css?inline';
import sans from '@fontsource-variable/hanken-grotesk/wght.css?inline';
import mono400 from '@fontsource/ibm-plex-mono/400.css?inline';
import mono500 from '@fontsource/ibm-plex-mono/500.css?inline';
import mono600 from '@fontsource/ibm-plex-mono/600.css?inline';

/** A modellek ugyanazokat a helyi fontfájlokat használják, mint a cikk. */
export function GET() {
  return new Response([
    serif.replaceAll('Fraunces Variable', 'Fraunces'),
    sans.replaceAll('Hanken Grotesk Variable', 'Hanken Grotesk'),
    mono400, mono500, mono600,
  ].join('\n'), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
}
