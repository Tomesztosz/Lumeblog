#!/usr/bin/env python3
"""ElevenLabs-kliens a kabalákhoz. A kulcsot és a hangokat egy .env-fájlból olvassa
(alapból E:\\Lume\\.env.elevenlabs), soha nem írja ki.

  ELEVENLABS_API_KEY, ELEVENLABS_VOICE_<KARAKTER>, ELEVENLABS_MODEL
A karakter neve a forgatókönyv sorának elején áll: TEN-TEN: → VOICE_TENTEN, DOT: → VOICE_DOT."""
import json, os, re, sys, urllib.request, urllib.error
from pathlib import Path

ENV_PATHS = [os.environ.get('ELEVENLABS_ENV', ''), '/mnt/user-data/uploads/Lume/.env.elevenlabs', str(Path.home() / 'mnt/Lume/.env.elevenlabs')]


def load_env():
    for p in ENV_PATHS:
        if p and Path(p).is_file():
            env = {}
            for line in Path(p).read_text(encoding='utf-8-sig').splitlines():
                m = re.match(r'\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$', line)
                if m: env[m.group(1)] = m.group(2).strip('"\'')
            return env
    raise SystemExit('Nincs .env.elevenlabs fájl.')


ENV = load_env()
KEY = ENV.get('ELEVENLABS_API_KEY', '')


def api(path, body=None, accept='application/json'):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': accept}, method='POST' if body is not None else 'GET')
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return r.read()
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors='replace')[:400]
        raise SystemExit(f'ElevenLabs hiba {e.code} ({path.split("?")[0]}): {msg}')


def voice_for(speaker):
    k = 'ELEVENLABS_VOICE_' + re.sub(r'[^A-Z0-9]', '', speaker.upper())
    v = ENV.get(k)
    if not v: raise SystemExit(f'Nincs hang ehhez a szereplőhöz: {speaker} (hiányzó {k})')
    return v


def tts(speaker, text, out, model=None, settings=None):
    body = {'text': text, 'model_id': model or ENV.get('ELEVENLABS_MODEL') or 'eleven_v3'}
    if settings: body['voice_settings'] = settings
    audio = api(f'/v1/text-to-speech/{voice_for(speaker)}?output_format=mp3_44100_192', body, 'audio/mpeg')
    Path(out).write_bytes(audio); return out


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'check':
        print('kulcs:', 'megvan' if KEY else 'HIÁNYZIK', '| modell a fájlban:', ENV.get('ELEVENLABS_MODEL', '(nincs)'))
        for k, v in ENV.items():
            if k.startswith('ELEVENLABS_VOICE_'):
                try: info = json.loads(api(f'/v1/voices/{v}')); print(f'  {k[17:]:8s} → {info.get("name")}')
                except SystemExit as e: print(f'  {k[17:]:8s} → {e}')
        try:
            models = json.loads(api('/v1/models')); print('modellek:', ', '.join(m['model_id'] for m in models))
        except SystemExit as e: print('modellek:', e)
